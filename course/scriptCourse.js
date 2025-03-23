function togglePreviewHeight() { 
    const lessonStyle = this; 
    const preview = lessonStyle.querySelector('.lesson-preview'); 
    
    if (preview.style.height === '150px') { 
        preview.style.height = '0'; 
    } else { 
        preview.style.height = '150px'; 
    } 
} 

document.querySelectorAll('.lesson-style').forEach(function(lessonStyle) { 
    lessonStyle.addEventListener('click', togglePreviewHeight); 
});