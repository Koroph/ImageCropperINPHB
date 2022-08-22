import Cropper from 'cropperjs';
import Swal from 'sweetalert2/dist/sweetalert2'

const jq = require('jquery');

document.addEventListener('DOMContentLoaded', function () {
    (function () {
        const imgBox = document.getElementById('image-cropper-view-thumb'),
            imgFile = document.getElementById('image-file'),
            modalContainer = document.getElementById('image-cropper-modal-container'),
            cropperImage = document.getElementById('cropper-image-view'),
            icon = document.getElementById('take-image-icon'),
            imgPreview = document.getElementById('take-image-preview'),
            imageCropperContainer = document.getElementById('image-cropper-view-container'),
            buttonCropperDone = document.getElementById('image-cropper-done'),
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
                    //imgFile.value = "";
                    /*cropper = null;
                    blob = null;*/
                }
            });

            imageCropperContainer.addEventListener('submit', function (e) {
                e.preventDefault();
                let fd = new FormData(document.forms[0]);
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

                    fd.append("_file", blob, imgFile.files[0].name);
                    modalContainer.style.display = "none";
                    imgFile.value = "";
                    //
                    cropper = null;
                    blob = null;
                    jq.ajax({
                        url: document.body.dataset.send.toString(),
                        type: "POST",
                        dataType: "json",
                        data: fb,
                        contentType: false,
                        processData: false,
                        xhr: function () {
                            const xhr = new window.XMLHttpRequest();
                            /* if (xhr.upload) {
                                 xhr.upload.addEventListener('progress', function (event) {
                                     let percent = 0;
                                     const position = event.loaded || event.position;
                                     const total = event.total;
                                     if (event.lengthComputable) {
                                         percent = Math.ceil(position / total * 100);
                                         progress.style.width = "" + percent + "%";
                                     }

                                 }, true);
                             }*/
                            return xhr;
                        }
                    }).done(function (response) {
                        if (response.error === null) {
                            Swal.fire({
                                title: "Enregistrement effectué avec succès",
                                timer: 1200,
                                icon: ICON_TYPE_SUCCESS,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire({
                                title: response.message,
                                icon: ICON_TYPE_ERROR,
                                confirmButtonText: CONFIRM_TEXT
                            });
                            cropper.destroy();
                        }

                    }).fail(function (error) {
                        Swal.fire({
                            title: FETCH_ERROR,
                            text: FETCH_ERROR_HELP,
                            icon: ICON_TYPE_ERROR,
                            confirmButtonText: CONFIRM_TEXT
                        });
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
    })()
});