document.querySelectorAll('.month').forEach(month => {
    const header = month.querySelector('.month-header');
    const content = month.querySelector('.month-content');
    const arrow = header.querySelector('.arrow');
    
    header.addEventListener('click', () => {
        content.classList.toggle('open');
        arrow.classList.toggle('open');
        if(content.classList.contains('open')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            content.style.maxHeight = '0';
        }
    });
});
