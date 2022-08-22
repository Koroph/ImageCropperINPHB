import Cropper from 'cropperjs';
import Swal from 'sweetalert2/dist/sweetalert2'

const jq = require('jquery');

document.addEventListener('DOMContentLoaded', function () {
    (function () {

        const body = document.body,
            _url = body.dataset.send,
            fieldInner = document.getElementById(body.dataset.field);

        if (fieldInner) {
            fieldInner.insertAdjacentHTML('beforebegin', domView());
            const fieldContainer = document.getElementById('image-cropper-view-fields');
            fieldContainer.appendChild(fieldInner)
            fieldInner.style.display = "block";

            const imgBox = document.getElementById('image-cropper-view-thumb'),
                imgFile = document.getElementById('image-file'),
                modalContainer = document.getElementById('image-cropper-modal-container'),
                cropperImage = document.getElementById('cropper-image-view'),
                icon = document.getElementById('take-image-icon'),
                imgPreview = document.getElementById('take-image-preview'),
                imageCropperContainer = document.getElementById('image-cropper-view-container'),
                buttonCropperDone = document.getElementById('image-cropper-done'),
                progress = document.getElementById('progress-bar'),
                buttonModalInit = document.getElementsByClassName('image-cropper-cancel'),
                CONFIRM_TEXT = "OK",
                ICON_TYPE_ERROR = "error",
                FETCH_ERROR = "Veuillez vous connecter à internet et réessayer",
                FETCH_ERROR_HELP = "Signaler ce problème à l'informaticien si l'erreur persiste",
                ICON_TYPE_SUCCESS = "success";
            let cropper = null, blob = null;

            if (imgBox && modalContainer) {
                imgBox.addEventListener('click', function () {
                    imgFile.click();
                });

                imgFile.addEventListener('change', function (e) {
                    modalContainer.style.display = "flex";
                    icon.style.display = "none";
                    imgPreview.style.display = "block";
                    if (cropper !== null)
                        cropper.destroy();
                    fileImageReader(e.target.files[0], cropperImage)
                    cropper = new Cropper(cropperImage, {
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
                        preview: imgPreview,
                        ready(event) {
                            this.cropper.scale(1);
                            // fileBox.style.display = "none";
                        }
                    });

                });

                for (let i = 0; i < buttonModalInit.length; i++) {
                    buttonModalInit[i].addEventListener('click', function () {
                        if (cropper !== null) {
                            icon.style.display = "block";
                            imgPreview.style.display = "none";
                            modalContainer.style.display = "none";
                            imgFile.value = "";
                            cropper.destroy();
                            cropper = null;
                            blob = null;
                        }
                    });
                }

                buttonCropperDone.addEventListener('click', function () {

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
                        }).toBlob((_blob) => {
                            blob = _blob
                        }, imgFile.files[0].type, 'high');
                        modalContainer.style.display = "none";

                    }
                });

                imageCropperContainer.addEventListener('reset', function (e) {
                    if (cropper !== null) {
                        cropper.destroy();
                        cropper = null;
                        blob = null;
                        icon.style.display = "block";
                        imgPreview.style.display = "none";
                    }
                });

                imageCropperContainer.addEventListener('submit', function (e) {
                    e.preventDefault();
                    let _____fd = new FormData(document.forms[0]);
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
                        }).toBlob((_blob) => {
                            blob = _blob
                        }, imgFile.files[0].type, 'high');

                        _____fd.append("_file", blob, imgFile.files[0].name);
                        modalContainer.style.display = "none";
                        imgFile.value = "";

                        jq.ajax({
                            url: _url,
                            type: "POST",
                            dataType: "json",
                            data: _____fd,
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
                            if (response.error === false) {
                                Swal.fire({
                                    title: "Enregistrement effectué avec succès",
                                    timer: 1200,
                                    icon: ICON_TYPE_SUCCESS,
                                    showConfirmButton: false
                                });
                                if (cropper !== null) {
                                    cropper.destroy();

                                    cropper = null;
                                    blob = null;
                                }
                                icon.style.display = "block";
                                imgPreview.style.display = "none";
                                document.forms[0].reset();
                            } else {
                                Swal.fire({
                                    title: response.message,
                                    icon: ICON_TYPE_ERROR,
                                    confirmButtonText: CONFIRM_TEXT
                                });

                            }
                            setTimeout(()=>progress.style.width = "0",500);
                        }).fail(function (error) {
                            Swal.fire({
                                title: FETCH_ERROR,
                                text: FETCH_ERROR_HELP,
                                icon: ICON_TYPE_ERROR,
                                confirmButtonText: CONFIRM_TEXT
                            });
                            setTimeout(()=>progress.style.width = "0",500);
                        });
                    } else {
                        Swal.fire({
                            title: 'Veuillez sélectionner une image',
                            icon: ICON_TYPE_ERROR,
                            confirmButtonText: CONFIRM_TEXT
                        });
                    }
                    return false;
                });
            }

        }

        /**
         * @param {File|blob} file
         * @param {HTMLImageElement} img
         * @private
         */
        function fileImageReader(file, img) {
            if (file instanceof File) {
                img.src = URL.createObjectURL(file);
            } else {
                img.src = file;
            }
        }

        function domView() {
            return `<div id="image-cropper-view">
                <form id="image-cropper-view-container">
                    <div id="progress-bar"></div>
                    <div id="image-cropper-view-thumb">
                        <div id="take-image-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="58px"
                                 viewBox="0 0 24 24" width="58px" fill="#000000">
                                <rect fill="none" height="24" width="24"/>
                                <path d="M3,4V1h2v3h3v2H5v3H3V6H0V4H3z M6,10V7h3V4h7l1.83,2H21c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V10H6z M13,19c2.76,0,5-2.24,5-5s-2.24-5-5-5s-5,2.24-5,5S10.24,19,13,19z M9.8,14c0,1.77,1.43,3.2,3.2,3.2s3.2-1.43,3.2-3.2 s-1.43-3.2-3.2-3.2S9.8,12.23,9.8,14z"/>
                            </svg>
                        </div>
                        <input style="display: none;" accept="image/*" type="file" id="image-file">
                        <div id="take-image-preview"></div>
                    </div>
                    <div id="image-cropper-view-fields"></div>
                    <div id="image-cropper-view-footer">
                        <button type="reset">Annuler</button>
                        <button type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
            <div style="display: none;" id="image-cropper-modal-container">
                <div id="image-cropper-modal">
                    <header id="image-cropper-modal-header">
                        <button class="image-cropper-cancel">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#000000">
                                <path d="M0 0h24v24H0z" fill="none"/>
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </header>
                    <div id="image-cropper-modal-content">
                        <img id="cropper-image-view" width="255" height="255" src="" alt="Image editor">
                    </div>
                    <div id="image-cropper-modal-footer">
                        <button class="image-cropper-cancel">Annuler</button>
                        <button id="image-cropper-done">Terminer</button>
                    </div>
                </div>
            </div>`;
        }
    })()
});