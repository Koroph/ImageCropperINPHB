import Cropper from 'cropperjs';
import Swal from 'sweetalert2/dist/sweetalert2'

const jq = require('jquery');

document.addEventListener('DOMContentLoaded', function () {

    const container = document.getElementById('picture-resizing-box-base'),
        content = `<div id="picture-resizing-box">
    <div id="picture-resizing-box-checked">
        <input type="text" maxlength="4" id="_matricule" placeholder="Matricule">
        <input type="text" maxlength="4" id="__matricule" placeholder="Matricule">
        <button id="_checked">
            <span>Verification</span>
        </button>
    </div>
    <div id="picture-resizing">
        <div id="picture-resizing-editor">
            <img id="image" width="255" height="255" src="" alt="Image editor">
            <div id="picture-resizing-editor-action">
                <div id="picture-resizing-editor-progress"></div>
                <button id="picture-resizing-editor-action-cancel">Annuler</button>
                <button id="picture-resizing-editor-action-save">Enregistrer</button>
            </div>
        </div>
        <div id="picture-resizing-preview">
            <div id="preview-image" style="width: 105px;height: 125px;overflow: hidden;"></div>
        </div>
        <div id="picture-resizing-file-box">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="64px"
                     viewBox="0 0 24 24" width="64px" fill="#000000">
                    <rect fill="none" height="24" width="24"/>
                    <path d="M3,4V1h2v3h3v2H5v3H3V6H0V4H3z M6,10V7h3V4h7l1.83,2H21c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V10H6z M13,19c2.76,0,5-2.24,5-5s-2.24-5-5-5s-5,2.24-5,5S10.24,19,13,19z M9.8,14c0,1.77,1.43,3.2,3.2,3.2s3.2-1.43,3.2-3.2 s-1.43-3.2-3.2-3.2S9.8,12.23,9.8,14z"/>
                </svg>
            </div>
            <input style="display: none;" accept="image/*" type="file" id="picture-resizing-file">
        </div>
    </div>
</div>`;
    if (container) {
        container.innerHTML = content;
        const image = document.getElementById('image'),
            file = document.getElementById('picture-resizing-file'),
            cancel = document.getElementById('picture-resizing-editor-action-cancel'),
            save = document.getElementById('picture-resizing-editor-action-save'),
            _matricule = document.getElementById('_matricule'),
            progress = document.getElementById('picture-resizing-editor-progress'),
            __matricule = document.getElementById('__matricule'),
            _checked = document.getElementById('_checked'),
            fileBox = document.getElementById('picture-resizing-file-box'),
            CONFIRM_TEXT = "OK",
            ICON_TYPE_ERROR = "error",
            FETCH_ERROR = "Veuillez vous connecter à internet et réessayer",
            FETCH_ERROR_HELP = "Signaler ce problème à l'informaticien si l'erreur persiste",
            ICON_TYPE_SUCCESS = "success";
        let cropper = null, matricule = null;

        if (image && file && fileBox) {
            fileBox.addEventListener('click', () => {
                if (matricule !== null) file.click();
                else Swal.fire({
                    title: "Veuillez saisir le matricule de l'étudiant",
                    icon: ICON_TYPE_ERROR,
                    confirmButtonText: CONFIRM_TEXT
                });
            });
            file.addEventListener('change', function (event) {
                if (cropper === null) {
                    _checked.setAttribute("disabled", "");
                    fileImageReader(event.target.files[0], image);
                    cropper = new Cropper(image, {
                        aspectRatio: 105 / 125,
                        responsive: true,
                        dragMode: 'move',
                        autoCropArea: 0.5,
                        restore: false,
                        guides: true,
                        center: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: false,
                        toggleDragModeOnDblclick: false,
                        preview: "#preview-image",
                        ready(event) {
                            this.cropper.scale(1);
                            fileBox.style.display = "none";
                        }
                    });
                } else _checked.removeAttribute("disabled");
            });
            _checked.addEventListener('click', function () {
                matricule = null;

                const _matricule_value = _matricule.value.toString(),
                    __matricule_value = __matricule.value.toString();
                if (_matricule_value !== "" && __matricule_value !== "" && _matricule_value === __matricule_value) {
                    if (_matricule_value.length === 4 && __matricule_value.length === 4) {
                        jq.ajax({
                            url: container.dataset.checked.toString(),
                            type: "POST",
                            dataType: "json",
                            data: {_matricule: _matricule.value.toString()}
                        }).done(function (response) {
                            if (response.matricule === null) {
                                Swal.fire({
                                    title: response.message,
                                    icon: ICON_TYPE_ERROR,
                                    confirmButtonText: CONFIRM_TEXT
                                });
                                _checked.removeAttribute("disabled");
                            } else {
                                matricule = response.matricule;
                                if (matricule !== null) file.click();
                            }
                        }).fail(function (error) {
                            _checked.removeAttribute("disabled");
                            matricule = null;
                            Swal.fire({
                                title: FETCH_ERROR,
                                text: FETCH_ERROR_HELP,
                                icon: ICON_TYPE_ERROR,
                                confirmButtonText: CONFIRM_TEXT
                            });
                        });

                    } else Swal.fire({
                        title: 'Les champs matricules doivent contenir 4 caractères',
                        icon: 'error',
                        confirmButtonText: CONFIRM_TEXT
                    });
                } else {
                    matricule = null;
                    Swal.fire({
                        title: 'Les matricules sont différents',
                        icon: ICON_TYPE_ERROR,
                        confirmButtonText: CONFIRM_TEXT
                    });
                }
            });
            cancel.addEventListener('click', function () {
                clearEditor(0);
            });
            save.addEventListener('click', function () {
                const formData = new FormData();
                if (cropper !== null) {
                    cropper.getCroppedCanvas({
                        width: 105,
                        height: 125,
                        minWidth: 100,
                        minHeight: 100,
                        maxWidth: 360,
                        maxHeight: 360,
                        fillColor: '#fff',
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high',
                    }).toBlob((blob) => {
                        formData.append("_matricule", matricule);
                        formData.append("_file", blob, file.files[0].name);
                        cancel.setAttribute("disabled", "");
                        save.setAttribute("disabled", "");
                        jq.ajax({
                            url: container.dataset.send.toString(),
                            type: "POST",
                            dataType: "json",
                            data: formData,
                            contentType: false,
                            processData: false,
                            xhr: function () {
                                const xhr = new window.XMLHttpRequest();
                                if (xhr.upload) {
                                    xhr.upload.addEventListener('progress', function (event) {
                                        let percent = 0;
                                        const position = event.loaded || event.position;
                                        const total = event.total;
                                        if (event.lengthComputable) {
                                            percent = Math.ceil(position / total * 100);
                                            progress.style.width = "" + percent + "%";
                                        }

                                    }, true);
                                }
                                return xhr;
                            }
                        }).done(function (response) {
                            if (response.error === null) {
                                clearEditor();
                                Swal.fire({
                                    title: "Enregistrement effectué avec succès",
                                    timer: 1200,
                                    icon: ICON_TYPE_SUCCESS,
                                    showConfirmButton: false
                                });
                            } else Swal.fire({
                                title: response.message,
                                icon: ICON_TYPE_ERROR,
                                confirmButtonText: CONFIRM_TEXT
                            });
                        }).fail(function (error) {
                            Swal.fire({
                                title: FETCH_ERROR,
                                text: FETCH_ERROR_HELP,
                                icon: ICON_TYPE_ERROR,
                                confirmButtonText: CONFIRM_TEXT
                            });
                            clearEditor();
                        });

                    }, file.files[0].type, 'high');
                }
            });

            _matricule.addEventListener('input', function (ev) {
                if (ev.target.value.toString().length === 4) {
                    __matricule.focus();
                }
            });
            __matricule.addEventListener('input', function (ev) {
                if (ev.target.value.toString().length === 4 && _matricule.value.toString().length < 4) {
                    _matricule.focus();
                }
            });
        }

        /**
         * @param {File|string} file
         * @param {HTMLImageElement} img
         * @private
         */
        function fileImageReader(file, img) {
            if (file instanceof File) {
                /* const reader = new FileReader();
                 reader.onload = function (_event) {
                     img.src = _event.target.result;
                 }
                 reader.readAsDataURL(file)*/
                img.src = URL.createObjectURL(file)
            } else {
                img.src = file;
            }
        }

        function clearEditor(timeOut = 800) {
            if (cropper) {
                setTimeout(function () {
                    cropper.destroy();
                    cropper = null;
                    matricule = null;
                    fileBox.style.display = "flex";
                    file.value = "";
                    image.src = "";
                    _matricule.value = "";
                    __matricule.value = "";
                    _checked.removeAttribute("disabled");
                    cancel.removeAttribute("disabled");
                    save.removeAttribute("disabled");
                    if (timeOut > 0) progress.style.width = "0%";
                }, timeOut);
            }
        }
    }

});

