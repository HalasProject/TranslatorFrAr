const { ipcRenderer } = require("electron");
const ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
const Swal = require("sweetalert2");
const DBI = require("../../models/words");

window.onload = function () {
  document.getElementById("loading").style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {

  loadEditor();
  document.getElementById("addword-form").addEventListener("submit", (e) => {
    storeWord(e);
  });
  
});

function loadEditor() {
  const {config_ar,config_fr} = require('../js/ckeditor.js')

  let description_arabe = document.getElementById("description_arabe");
  let description_francais = document.getElementById("description_francais");

  ClassicEditor.create(description_arabe,config_ar)
    .then((editor) => {
      window.description_arabe_add = editor;
    })
    .catch((e) => {
      console.log(e);
    });

  ClassicEditor.create(description_francais,config_fr)
    .then((editor) => {
      window.description_francais_add = editor;
    })
    .catch((e) => {
      console.log(e);
    });
}

function storeWord(e) {
  e.preventDefault();

  description_arabe = window.description_arabe_add;
  description_francais = window.description_francais_add;
  mot_arabe = document.getElementById("mot_ar");
  mot_francais = document.getElementById("mot_fr");

  description_arabe.updateSourceElement();
  description_francais.updateSourceElement();

  const word = {
    fr_name: mot_francais.value,
    fr_description: description_francais.getData(),
    ar_name: mot_arabe.value,
    ar_description: description_arabe.getData(),
  };
  var database = new DBI();
  database
    .store(word)
    .then((id) => {
      ipcRenderer.send("word-added", id);
      ipcRenderer.send('notification',{
        id:id,
        type:'word-added',
        message:'Votre mot a etait creé avec success'
      })
      cleanData();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Votre mot a etait creé avec success",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .catch((err) => console.log(err));
}

function cleanData() {
  window.description_francais_add.setData("");
  window.description_arabe_add.setData("");
  document.getElementById("mot_fr").value = "";
  document.getElementById("mot_ar").value = "";
}
