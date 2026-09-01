const slides = [...document.querySelectorAll('.slide')];
const currentLabel = document.querySelector('#current');
const totalLabel = document.querySelector('#total');
const chapterLabel = document.querySelector('#chapter');
const progress = document.querySelector('#progress');
const overviewDialog = document.querySelector('#overviewDialog');
const overviewGrid = document.querySelector('#overviewGrid');
let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));

const pad = value => String(value).padStart(2, '0');

function showSlide(index, updateHash = true) {
  const next = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === next);
    slide.classList.toggle('leaving', slideIndex < next);
    slide.setAttribute('aria-hidden', String(slideIndex !== next));
  });
  current = next;
  currentLabel.textContent = pad(current + 1);
  chapterLabel.textContent = slides[current].dataset.title;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  document.querySelector('#prev').disabled = current === 0;
  document.querySelector('#next').disabled = current === slides.length - 1;
  if (updateHash) history.replaceState(null, '', `#${current + 1}`);
}

function move(direction) {
  showSlide(current + direction);
}

totalLabel.textContent = pad(slides.length);
document.querySelector('#prev').addEventListener('click', () => move(-1));
document.querySelector('#next').addEventListener('click', () => move(1));
document.querySelector('.brand').addEventListener('click', () => showSlide(0));

document.addEventListener('keydown', event => {
  if (overviewDialog.open || ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    move(1);
  }
  if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    move(-1);
  }
  if (event.key === 'Home') showSlide(0);
  if (event.key === 'End') showSlide(slides.length - 1);
  if (event.key.toLowerCase() === 'o') openOverview();
});

let touchStart = 0;
document.addEventListener('touchstart', event => {
  touchStart = event.changedTouches[0].screenX;
}, { passive: true });
document.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].screenX - touchStart;
  if (Math.abs(distance) > 60) move(distance < 0 ? 1 : -1);
}, { passive: true });

slides.forEach((slide, index) => {
  const button = document.createElement('button');
  button.innerHTML = `<span>${pad(index + 1)}</span>${slide.dataset.title}`;
  button.addEventListener('click', () => {
    overviewDialog.close();
    showSlide(index);
  });
  overviewGrid.append(button);
});

function openOverview() {
  overviewDialog.showModal();
}

document.querySelector('#overview').addEventListener('click', openOverview);
document.querySelector('#closeOverview').addEventListener('click', () => overviewDialog.close());
overviewDialog.addEventListener('click', event => {
  if (event.target === overviewDialog) overviewDialog.close();
});

const stateContent = [
  '<span>$</span> git status<br><strong>modified: equipo.txt</strong>',
  '<span>$</span> git status<br><strong>changes to be committed: equipo.txt</strong>',
  '<span>$</span> git log -1 --oneline<br><strong>a1b2c3d Agregar equipo</strong>'
];
document.querySelectorAll('[data-state]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-state]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelector('#stateOutput').innerHTML = stateContent[Number(button.dataset.state)];
  });
});

document.querySelectorAll('.copy').forEach(button => {
  button.addEventListener('click', async () => {
    const text = button.nextElementSibling.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'copiado';
      setTimeout(() => { button.textContent = 'copiar'; }, 1200);
    } catch {
      button.textContent = 'selecciona';
    }
  });
});

const commitDescriptions = {
  feat: 'agregar marcador',
  fix: 'evitar puntos durante empates',
  docs: 'explicar reglas del juego',
  refactor: 'separar cálculo del ganador'
};
document.querySelectorAll('[data-prefix]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-prefix]').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#commitExample').textContent = `${button.dataset.prefix}: ${commitDescriptions[button.dataset.prefix]}`;
  });
});

document.querySelector('#rebaseDemo button').addEventListener('click', () => {
  document.querySelector('#rebaseDemo').classList.toggle('played');
});

document.querySelectorAll('#conflict button').forEach(button => {
  button.addEventListener('click', () => {
    const resolution = document.querySelector('#resolution');
    resolution.textContent = `Resuelto: ${button.dataset.choice}`;
    resolution.classList.add('resolved');
  });
});

const strategies = {
  merge: ['Conserva topología', 'Mantiene commits y agrega un commit con dos padres.'],
  squash: ['Compacta la propuesta', 'Crea un commit nuevo; útil, pero cambia la identidad del historial.'],
  rebase: ['Produce una línea', 'Reproduce cada commit sobre la base sin crear un nodo de merge.']
};
document.querySelectorAll('[data-strategy]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-strategy]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const [title, description] = strategies[button.dataset.strategy];
    document.querySelector('#strategyOutput').innerHTML = `<b>${title}</b><p>${description}</p>`;
  });
});

window.addEventListener('hashchange', () => {
  const requested = Number(location.hash.slice(1)) - 1;
  if (Number.isInteger(requested)) showSlide(requested, false);
});

showSlide(current, false);
