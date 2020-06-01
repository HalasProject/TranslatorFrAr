const { ipcRenderer } = require("electron");
const DBI = require("../../models/words");
var database = new DBI();
const Swal = require("sweetalert2");

window.onload = function () {
  document.getElementById("loading").style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
  
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
      if(!isNaN(window.currentWord)){
        updateWord(event)
      } else {

        console.log('je fait rien jai aucun doc')
      }
    }
  });

  window.doc = new Proxy(
    {},
    {
      set: function (obj, prop, valeur) {
        if (prop == "currentWord") {
          if (isNaN(valeur) || valeur == undefined) {
            window.currentWord = undefined
            document.getElementById("float-options").style.display = "none";
          } else if (typeof valeur == "number") {
            window.currentWord = valeur
            document.getElementById("float-options").style.display = "block";
          }
        }
      },
     
    }
  );

  window.doc.currentWord = undefined;

  //Load Ckeditor5
  loadEditor();

  //Get totale count of words
  totale_words();

  //Save Word
  document.getElementById("save").addEventListener("click", (e) => {
    updateWord(e);
  });
  //Delete Word
  document.getElementById("delete").addEventListener("click", deleteWord);

  document.getElementById("togler").addEventListener("click", (e) => {
    $(".ui.sidebar").sidebar("toggle");
  });

  document.querySelectorAll(".langue").forEach((button) => {
    let langue = button.dataset.langue;
    if (window.localStorage.getItem(langue) == "true") {
      button.classList.add("positive");
    }
    if (!button.classList.contains("positive")) {
      document.getElementById(langue).style.display = "none";
    }
    button.onclick = function (e) {
      if (this.classList.contains("positive")) {
        this.classList.remove("positive");
        window.localStorage.setItem(langue, false);
        document.getElementById(langue).style.display = "none";
      } else {
        this.classList.add("positive");
        window.localStorage.setItem(langue, true);
        document.getElementById(langue).style.display = "block";
      }
    };
  });

  document.getElementById("searching").addEventListener("keyup", (e) => {
    let worlds = document.querySelector("#sidebar").childNodes;
    let search = e.target.value;

    worlds.forEach((a) => {
      a.style.display = "block";
    });

    worlds.forEach((a) => {
      if (!a.innerHTML.toUpperCase().includes(search.toUpperCase())) {
        a.style.display = "none";
      }
    });
    $(".ui.sidebar").sidebar("show");
  });

  document.getElementById("home").addEventListener("click", (e) => {
    window.doc.currentWord = undefined;
    let presentation = document.querySelector("#presentation");
    if (presentation.style.display == "none") {
      presentation.style.display = "block";
      document.querySelector("#traduction").style.display = "none";
    } else {
      presentation.style.display = "none";
      document.querySelector("#traduction").style.display = "block";
    }
  });

  document.querySelector("#addWord").addEventListener("click", (e) => {
    e.preventDefault();
    ipcRenderer.send("show-addWord");
  });

  document.getElementById("maximize").addEventListener("click", (e) => {
    ipcRenderer.send("maximize-app");
  });

  document.getElementById("close").addEventListener("click", (e) => {
    ipcRenderer.send("close-app");
  });
});

function totale_words() {
  database.size().then((size) => {
    document.getElementById("size").textContent = size;
  });
}

function loadEditor() {
  const {config_ar,config_fr} = require('../js/ckeditor.js')
  const InlineEditor = require("@ckeditor/ckeditor5-build-inline");
  
  InlineEditor.create(document.getElementById("description_francais"),config_fr)
    .then((editor) => {
      window.description_francais = editor;
      description_francais.model.document.on("change:data", () => {
        document.getElementById("save").style.display = "block";
        console.log("The french has changed!");
      });
    })
    .catch((error) => {
      console.error(error);
    });

  InlineEditor.create(document.getElementById("description_arabe"),config_ar)
    .then((editor) => {
      window.description_arabe = editor;
      description_arabe.model.document.on("change:data", () => {
        document.getElementById("save").style.display = "block";
        console.log("The arabe has changed!");
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function fetchData() {
  database.size().then((size) => {
    if (size == 0) {
      if (document.getElementById("loader")) {
        document.getElementById("loader").style.display = "none";
      }

      document.getElementById("sidebar").innerHTML = `
      <div
      class="ui active dimmer"
      id="No worlds"
      style="background-color: #00000000;"
    >
      <div class="ui text" style="color:white">Pas encore de mots</div>
    </div>
    <p></p>`;
    } else {
      database.getAll().then((data) => {
        let element = "";
        data.forEach((a) => {
          element += `<a class="item word" data-id="${a.id}">${a.fr_name} - ${a.ar_name}</a>`;
        });
        if (document.getElementById("loader")) {
          document.getElementById("loader").style.display = "none";
        }
        document.getElementById("sidebar").innerHTML = element;

        document.querySelectorAll(".word").forEach((word) => {
          word.onclick = function (e) {
            let elem = `<div class="ui active tiny inline loader " id="tinyloader" style="float: right;"></div>`;
            console.log(elem);
            e.target.innerHTML += elem;
            database.getOne(parseInt(e.target.dataset.id)).then((data) => {
              editWord(data);
              document.getElementById("presentation").style.display = "none";
              document.getElementById("traduction").style.display = "block";
              e.target.removeChild(document.getElementById("tinyloader"));
              $(".ui.sidebar").sidebar("toggle");
            });
          };
        });
      });
    }
  });
}

function updateWord(e) {
  e.preventDefault();

  var data = {
    ar_description: window.description_arabe.getData(),
    fr_description: window.description_francais.getData(),
  };

  var currentWord = parseInt(window.currentWord);
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  database
    .update(currentWord, data)
    .then(() => {
      ipcRenderer.send('notification',{
        type:'word-update',
        message:'Votre travaille a etait sauvegarder '
      })
      Toast.fire({
        icon: "success",
        title: "Votre travaille a etait sauvegarder",
      });
    })
    .catch((e) => {
      Toast.fire({
        icon: "error",
        title: e,
      });
    });
  // "Erreur lors du sauvgardement !"
}

function editWord(data) {
  window.description_francais.setData(data.fr_description);
  window.description_arabe.setData(data.ar_description);
  document.getElementById("mot_francais").textContent = data.fr_name;
  document.getElementById("mot_arabe").textContent = data.ar_name;
  window.doc.currentWord = parseInt(data.id);
}

function deleteWord() {
  database.delete(parseInt(window.currentWord)).then(() => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          window.doc.currentWord = undefined
          fetchData();
          totale_words();

          document.getElementById("presentation").style.display = "block";
          document.getElementById("traduction").style.display = "none";
          swalWithBootstrapButtons.fire(
            "Deleted!",
            "Your file has been deleted.",
            "success"
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "Your imaginary file is safe :)"
          );
        }
      });
  });
}

ipcRenderer.on("new-word-added", (event, message) => {
  fetchData();
  totale_words();
});

ipcRenderer.on('show-word',(event,id)=>{
  $(`[data-id=${id}]`).click()
  $(".ui.sidebar").sidebar("toggle");
})

fetchData();

