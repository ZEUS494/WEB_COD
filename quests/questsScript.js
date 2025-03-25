const modal = document.querySelector('.modal');
const closeButton = document.querySelector('.close-modal');
const modalTitle = document.querySelector('.modal-title');
const modalDescription = document.querySelector('.modal-description');

function openModal(questId) {
    console.log(`Opening modal for quest with ID: ${questId}`);

    const questElement = document.querySelector(`.quest[data-quest-id="${questId}"]`);
    if (!questElement) {
        console.error(`Quest element not found for ID: ${questId}`);
        return;
    }

    const title = questElement.querySelector('h1').textContent;
    const description = questElement.querySelector('.questinfo').textContent;

    console.log(`Title: ${title}, Description: ${description}`);

    modalTitle.textContent = title;
    modalDescription.textContent = description;

    modal.style.display = 'block';
}

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

document.querySelectorAll('.quest').forEach(quest => {
    quest.addEventListener('click', () => {
        const questId = quest.dataset.questId;
        openModal(questId);
    });
});

document.getElementById('file-input').addEventListener('change', function(e) {
    var fileName = e.target.files[0].name;
    document.getElementById('currentFileName').textContent = fileName;
});