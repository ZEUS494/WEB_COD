document.addEventListener('DOMContentLoaded', () => {
    const edits = document.getElementById('switch-to-edit')
    const additions = document.getElementById('switch-to-addition')
    const tables = document.getElementById('switch-to-tables')
    const content1 = document.getElementById('content1');
    const content2 = document.getElementById('content2');
    const content3 = document.getElementById('content3');

    edits.addEventListener('click', function() {
        content1.style.display = 'flex'
        edits.style.border = '3px solid #ffd000'
        edits.style.color = '#fff'
        additions.style.border = 'none'
        additions.style.color = '#a4a4a4'
        tables.style.border = 'none'
        tables.style.color = '#a4a4a4'
        content2.style.display = 'none'
        content3.style.display = 'none'
    })

    additions.addEventListener('click', function() {
        content1.style.display = 'none'
        additions.style.color = '#fff'
        additions.style.border = '3px solid #ffd000'
        edits.style.border = 'none'
        edits.style.color = '#a4a4a4'
        tables.style.border = 'none'
        tables.style.color = '#a4a4a4'
        content2.style.display = 'flex'
        content3.style.display = 'none'
    })

    tables.addEventListener('click', function() {
        content1.style.display = 'none'
        additions.style.color = '#a4a4a4'
        additions.style.border = 'none'
        edits.style.border = 'none'
        edits.style.color = '#a4a4a4'
        tables.style.border = '3px solid #ffd000'
        tables.style.color = '#fff'
        content2.style.display = 'none'
        content3.style.display = 'flex'
    })
});