const books = []; //array untuk menampung data semua buku
const renderEvent = 'render-event'; // costum event untuk merender ulang tampilan html
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF';

function generateid() {
    return +new Date(); // bikin id berdasarkan date yang diambil berdasarkan milidetik saat itu
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

function getBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateid();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);
  
  document.dispatchEvent(new Event(renderEvent));

  saveData()
}

function getBook(bookId){
  for (const bookItem of books){
    if (bookItem.id == bookId){ return bookItem; }
  }
  return null;
} 

function addBookisComplete(bookId) {
  const book = getBook(bookId);
  if (book == null) return;
  book.isComplete = true;
  document.dispatchEvent(new Event(renderEvent));

  console.log(book.year);

  saveData()
}

function deleteBook(bookId){
  const book = getBookIndex(bookId);

  if (book === -1) return;

  books.splice(book, 1); // menghapus index 1 di array books
  document.dispatchEvent(new Event(renderEvent));

  saveData()
}

function undoBookFromCompalted(bookId) {
  const book = getBook(bookId);

  if (book === null) return;

  book.isComplete = false;
  document.dispatchEvent(new Event(renderEvent))

  saveData()
}

function makeBookList(book){
  const addTitle = document.createElement('h3');
  addTitle.innerText = book.title;
  addTitle.setAttribute('data-testid', 'bookItemTitle')

  const addAuthor = document.createElement('p');
  addAuthor.innerText = `Penulis: ${book.author}`;
  addAuthor.setAttribute('data-testid', 'bookItemAuthor')
  
  const addYear = document.createElement('p');
  addYear.innerText = `Tahun: ${book.year}`;
  addYear.setAttribute('data-testid', 'bookItemYear')
  
  // container untuk button
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button')

  // membuat button selesai dan belum selesai
  const toggleButton = document.createElement('button')
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');

  toggleButton.innerText = book.isComplete 
  ? "Belum Selesai dibaca" 
  : "Selesai dibaca";

  toggleButton.classList.add('toggle-button')
  
  toggleButton.addEventListener('click', () => {
    book.isComplete
    ? undoBookFromCompalted(book.id)
    : addBookisComplete(book.id)
  });
  
  // membuat button untuk menghapus buku
  const deleteButton = document.createElement('button');
  deleteButton.innerText = "Hapus Buku";
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.classList.add('delete-button')
  
  deleteButton.addEventListener('click', () =>
    deleteBook(book.id)
);

// membuat button untuk edit buku
const editButton = document.createElement('button');
editButton.innerText = "Edit Buku";
editButton.setAttribute(
  'data-testid', 
  'bookItemEditButton'
);
editButton.classList.add('edit-button')

  buttonContainer.append( 
    toggleButton,
    deleteButton, 
    editButton
  );

  // membuat container untuk data buku
  const bookContainer = document.createElement('div');
  bookContainer.classList.add('book');
  bookContainer.setAttribute('data-testid', 'bookItem');
  bookContainer.setAttribute('data-bookid', book.id);
  
  bookContainer.append(
    addTitle, 
    addAuthor, 
    addYear, 
    buttonContainer
  );

  return bookContainer;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  
  document.dispatchEvent(new Event(renderEvent));
}

document.addEventListener(renderEvent, () => {
  const uncompletedBook = document.getElementById('incompleteBookList');
  uncompletedBook.innerHTML = '';
  
  const completedBook = document.getElementById('completeBookList');
  completedBook.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBookList(bookItem);
    bookItem.isComplete 
    ? completedBook.append(bookElement)
    : uncompletedBook.append(bookElement);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('bookFormIsComplete');
  const statusText = document.getElementById('status');

  checkbox.addEventListener('change', () => {
    checkbox.checked 
    ? statusText.innerText = 'Selesai dibaca'
    : statusText.innerText = 'Belum selesai dibaca';
  });
  
  const submitForm = document.getElementById('book-form');

  submitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
    
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});