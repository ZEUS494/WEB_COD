document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('swith-to-main')
    const cources = document.getElementById('swith-to-cources')
    const content1 = document.getElementById('content1');
    const content2 = document.getElementById('content2');

    main.addEventListener('click', function() {
        content1.style.display = 'grid'
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
        content2.style.display = 'block'
    })
});

function togglePreviewHeight() { 
    const lessonStyle = this; 
    const preview = lessonStyle.querySelector('.lesson-preview'); 
    
    if (preview.style.display === 'block') { 
        preview.style.display = 'none'; 
    } else { 
        preview.style.display = 'block'; 
    } 
} 

document.querySelectorAll('.lesson-style').forEach(function(lessonStyle) { 
    lessonStyle.addEventListener('click', togglePreviewHeight); 
});