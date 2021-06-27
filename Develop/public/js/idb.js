const indexedDB = window.indexedDB;

let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  let db = event.target.result;
  db.createObjectStore("newBudget", { autoIncrement: true });
};
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.online) {
    uploadItem();
  }
};
request.onerror = function (event) {
  console.log(event.target.errorCode);
};
function saveRecord(record) {
  const transaction = db.transaction(["newBudget"], "readwrite");
  console.log(transaction);
  const ItemObjectStore = transaction.objectStore("newBudget");

  ItemObjectStore.add(record);
}
function uploadItem() {
  const transaction = db.transaction(["newBudget"], "readwrite");
  const itemObjectStore = transaction.objectStore("newBudget");
  const getAll = itemObjectStore.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["newBudget"], "readwrite");
          const itemObjectStore = transaction.objectStore("newBudget");
          itemObjectStore.clear();
          alert("All transactions submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}
window.addEventListener("online", uploadItem);