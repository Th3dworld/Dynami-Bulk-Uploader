'use strict'

const collectionName = document.getElementById('collection-name');
const btnSubmit = document.getElementById('btn-submit');

if(window.location.href === "http://localhost:3000/"){
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
    
    btnSubmit.addEventListener('click', () => {
        if(collectionName.value === "collection name" || collectionName.value === ""){
            alert("Please input a valid collection name")
        }
    })

console.log(window.location.href);

}   



if(window.location.href === "http://localhost:3000/upload"){
    console.log(window.location);

    setTimeout(() => {window.location = "http://localhost:3000/log"} , 2000);
}
