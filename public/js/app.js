'use strict'

const collectionName = document.getElementById('collection-name');

const collectionNameInit = () => {
    collectionName.value = "collection name";
    collectionName.classList.add('placeholder-text');
}

//initialize collection name input field
collectionNameInit();

collectionName.addEventListener('blur', () => {
    if(collectionName.value === ""){
        collectionNameInit();
    }
})

collectionName.addEventListener('focusin', () => {
    if(collectionName.value === "collection name"){
        collectionName.value = "";
    }
    collectionName.classList.remove('placeholder-text');
})



// Dropzone.options.myDropzone = {
//     paramName: "files", // The name that will be used to transfer the file
//     maxFilesize: 2, // MB
//     acceptedFiles: ".xlsx"
// };