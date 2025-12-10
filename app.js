const reader = document.getElementById('reader');
const addBtn = document.getElementById('add-selection');
const cardsContainer = document.getElementById('cards-container');
const search = document.getElementById('search');

// restore reader text
const savedReader = localStorage.getItem('doc-reader-v1');
if (savedReader !== null) {
  reader.value = savedReader;
}
reader.addEventListener('input', () => {
  localStorage.setItem('doc-reader-v1', reader.value);
});


let cards = []; // each card will be an object like { text: 'selected text', note: '' }
let editingIndex = null;


const saved = localStorage.getItem('doc-cards-v1');
if (saved) {
    cards = JSON.parse(saved);
    renderCards();
}


function renderCards(list=cards) {
  cardsContainer.innerHTML = "";

  list.forEach((card, index) => {
    const el = document.createElement('div');
    el.className = "card";

    // If this card is being edited
    if (editingIndex === index) {
      // input box
      const input = document.createElement('textarea');
      input.className = 'edit-input';
      input.value = card.text;

      // controls for save/cancel
      const controls = document.createElement('div');
      controls.className = 'card-controls';

      const saveBtn = document.createElement('button');
      saveBtn.className = 'save-edit';
      saveBtn.setAttribute('data-index', index);
      saveBtn.textContent = 'Save';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cancel-edit';
      cancelBtn.setAttribute('data-index', index);
      cancelBtn.textContent = 'Cancel';

      controls.appendChild(saveBtn);
      controls.appendChild(cancelBtn);

      el.appendChild(input);
      el.appendChild(controls);
    }

    // Normal display mode
    else {
      const textDiv = document.createElement('div');
      textDiv.className = 'card-text';
      textDiv.textContent = card.text;

      const controls = document.createElement('div');
      controls.className = 'card-controls';

      const editBtn = document.createElement('button');
      editBtn.className = 'card-edit';
      editBtn.setAttribute('data-index', index);
      editBtn.textContent = 'Edit';

      const delBtn = document.createElement('button');
      delBtn.className = 'card-delete';
      delBtn.setAttribute('data-index', index);
      delBtn.textContent = 'Delete';

      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      el.appendChild(textDiv);
      el.appendChild(controls);
    }

    cardsContainer.appendChild(el);
  });
}

renderCards();


addBtn.addEventListener("click",()=>{
  const start=reader.selectionStart;
  const end=reader.selectionEnd;
  const selectedText=reader.value.substring(start,end).trim();
  if (start === end || selectedText === '') {
    alert('Please select some text first.');
    return;
}
cards.unshift({ text: selectedText, note: '' });
localStorage.setItem("doc-cards-v1", JSON.stringify(cards));

renderCards();

reader.setSelectionRange(end, end); // moves caret to end of selection (deselects)
reader.focus();                     // keep focus in textarea
})

cardsContainer.addEventListener('click', (e) => {
  const edit = e.target.closest('.card-edit');
  const del  = e.target.closest('.card-delete');
  const save = e.target.closest('.save-edit');
  const cancel = e.target.closest('.cancel-edit');

  // DELETE
  if (del) {
    const i = Number(del.getAttribute('data-index'));
    if (!confirm('Delete this flashcard?')) return;
    cards.splice(i, 1);
    editingIndex = null;
    localStorage.setItem('doc-cards-v1', JSON.stringify(cards));
    renderCards();
    return;
  }

  // ENTER EDIT MODE
  if (edit) {
    const i = Number(edit.getAttribute('data-index'));
    editingIndex = i;
    renderCards();
    return;
  }

  // SAVE EDIT
  if (save) {
    const i = Number(save.getAttribute('data-index'));
    const textarea = cardsContainer.querySelector('.edit-input');
    const newText = textarea.value.trim();

    if (newText === '') {
      alert('Text cannot be empty.');
      return;
    }

    cards[i].text = newText;
    editingIndex = null;
    localStorage.setItem('doc-cards-v1', JSON.stringify(cards));
    renderCards();
    return;
  }

  // CANCEL EDIT
  if (cancel) {
    editingIndex = null;
    renderCards();
    return;
  }
});

search.addEventListener('input', () => {
  const term = search.value.toLowerCase();
  const filtered = cards.filter(c => c.text.toLowerCase().includes(term));
  renderCards(filtered);
});



