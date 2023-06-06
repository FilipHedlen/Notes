import tinymce from 'tinymce';

document.addEventListener("DOMContentLoaded", loadDocuments);

export function loadDocuments() {
  const userId = sessionStorage.getItem("userId");

  if (userId) {
    fetch("http://localhost:3000/docs", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const documents = data.documents;
          const documentList = renderDocumentList(documents);
          const newDocumentButton = createNewDocumentButton();
          const appContainer = document.querySelector("div#app");
          appContainer.innerHTML = "";
          appContainer.appendChild(documentList);
          appContainer.appendChild(newDocumentButton);
        }
      })
      .catch((error) => console.error(error));
  }
}

function renderDocumentList(documents) { 
    const documentList = window.document.createElement("ul");
    documentList.style.listStyle = 'none';
  
    documents.forEach((document) => {
      const listItem = window.document.createElement("li");
      const viewButton = window.document.createElement("button");
      viewButton.textContent = "View";
  
      const editButton = window.document.createElement("button");
      editButton.textContent = "Edit";
  
      listItem.textContent = document.title;
      listItem.appendChild(viewButton);
      listItem.appendChild(editButton);
      documentList.appendChild(listItem);
  
      viewButton.addEventListener("click", () => {
        viewDocument(document.id);
      });
  
      editButton.addEventListener("click", () => {
        editDocument(document.id);
      });
    });
  
    return documentList;
  }

function createNewDocumentButton() {
  const newDocumentButton = window.document.createElement("button");
  newDocumentButton.textContent = "New Document";
  newDocumentButton.classList.add("new-document-button");
  newDocumentButton.addEventListener("click", createNewDocument);
  return newDocumentButton;
}

function viewDocument(documentId) {
  fetch(`http://localhost:3000/docs/${documentId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const doc = data.document;
        renderDocumentContent(doc.title, doc.content, false); 
        const backButton = createBackButton();
        const deleteButton = createDeleteButton(documentId);
        document.querySelector("div#app").appendChild(backButton);
        document.querySelector("div#app").appendChild(deleteButton);
      }
    })
    .catch((error) => console.error(error));
}

function createBackButton() {
  const backButton = window.document.createElement("button");
  backButton.textContent = "Back";
  backButton.addEventListener("click", loadDocuments);
  return backButton;
}

function createDeleteButton(documentId) {
  const deleteButton = window.document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deleteDocument(documentId);
  });
  return deleteButton;
}

function editDocument(documentId) {
  fetch(`http://localhost:3000/docs/${documentId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const document = data.document;
        renderDocumentContent(document.title, document.content, true, documentId);
      }
    })
    .catch((error) => console.error(error));
}


function createNewDocument() {
  renderDocumentContent("", "", true);
}

function renderDocumentContent(title, content, isEditing, documentId) {
  const container = document.querySelector("div#app");
  container.innerHTML = "";

  const titleLabel = document.createElement("label");
  titleLabel.classList.add("title-label");
  titleLabel.textContent = "Title";
  container.appendChild(titleLabel);

  const titleInput = document.createElement("input");
  titleInput.classList.add("title-input");
  titleInput.value = title;
  container.appendChild(titleInput);

  const documentContent = window.document.createElement("div");
  documentContent.classList.add("tinymce-editor");
  documentContent.innerHTML = content;
  container.appendChild(documentContent);

  if (isEditing) {
    const saveButton = window.document.createElement("button");
    saveButton.classList.add("save-button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
      saveDocument(titleInput.value, tinymce.activeEditor.getContent(), documentId);
    });
    container.appendChild(saveButton);

    tinymce.init({
      selector: "div#app div.tinymce-editor",
      toolbar: "bold italic underline | undo redo | fontselect fontsizeselect table | forecolor backcolor | link unlink | image media code | alignleft aligncenter alignright | bullist numlist | fullscreen | cut copy paste",
      setup: function (editor) {
        editor.on("change", function () {
          editor.save();
        });
      },
      init_instance_callback: function (editor) {
        editor.setContent(content);
      },
    });
  }
  return { titleInput, documentContent, container, isEditing };
};


function saveDocument(title, content, documentId) {
  const requestBody = {
    title,
    content,
  };

  const url = documentId ? `http://localhost:3000/docs/${documentId}` : "http://localhost:3000/savedoc";
  const method = documentId ? "PUT" : "POST";

  const container = document.querySelector("div#app");

  if (tinymce.activeEditor) {
    requestBody.content = tinymce.activeEditor.getContent();
  }

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error: Failed to save document");
      }
    })
    .then((data) => {
      console.log("Server response:", data);

      if (data.success) {
        console.log("Document saved successfully");
        container.innerHTML = "";
        loadDocuments();
      } else {
        console.error("Error: Failed to save document");
      }
    })
    .catch((error) => console.error(error));
}


  function deleteDocument(documentId) {
    fetch(`http://localhost:3000/docs/${documentId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Document deleted successfully");
          loadDocuments(); // Refresh the document list
        } else {
          console.log("Failed to delete document");
        }
      })
      .catch((error) => console.error(error));
  }