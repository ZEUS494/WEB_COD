document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('switch-to-edit')
    const cources = document.getElementById('switch-to-addition')
    const content1 = document.getElementById('content1');
    const content2 = document.getElementById('content2');

    main.addEventListener('click', function() {
        content1.style.display = 'flex'
        main.style.border = '3px solid #ffd000'
        main.style.color = '#fff'
        cources.style.border = 'none'
        cources.style.color = '#a4a4a4'
        content2.style.display = 'none'
    })

    cources.addEventListener('click', function() {
        content1.style.display = 'none'
        main.style.border = 'none'
        main.style.color = '#a4a4a4'
        cources.style.color = '#fff'
        cources.style.border = '3px solid #ffd000'
        content2.style.display = 'flex'
    })
});