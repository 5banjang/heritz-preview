'use strict';

document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal());
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close],a[href^="#"]').forEach(control => {
    control.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});

document.querySelectorAll('[data-enlarge]').forEach(button => {
  button.addEventListener('click', () => {
    const source = button.querySelector('img');
    const photo = document.getElementById('enlarged-photo');
    photo.src = source.src;
    photo.alt = source.alt;
    document.getElementById('photo-dialog').showModal();
  });
});

document.querySelectorAll('[data-grade]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('grade-title').textContent = button.dataset.grade + ' · 렌탈 등급 안내';
    document.getElementById('grade-dialog').showModal();
  });
});
