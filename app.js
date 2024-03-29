// Global selections and variables

const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popUp = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');


let initialColors;

// Event listeners
generateButton.addEventListener('click', randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach(hex => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  })
})

popUp.addEventListener('transitionend',  () => {
  const popUpBox = popUp.children[0];
  popUp.classList.remove('active');
  popUpBox.classList.remove('active');
})

adjustButton.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  })
})

closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  })
})

// Functions
// Color Generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}



function randomColors() {
// start with empty colors
initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    //Add the colors to the array
    initialColors.push(randomColor.hex());

    //Add the Color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for contrast
    checkTextContrast(randomColor, hexText);

    // Initial Colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  // Reset Inputs
  resetInputs();

  //Check for Button Contrast
adjustButton.forEach((button, index) => {
  checkTextContrast(initialColors[index], button);
  checkTextContrast(initialColors[index], lockButton[index]);
})

}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // Scale saturation
  const noSaturation = color.set("hsl.s", 0);
  const fullSaturation = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSaturation, color, fullSaturation]);

  // Scale brightness
  const midBrightness = color.set("hsl.l", 0.5);
  const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);

  // Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(
    0
  )}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const sat = sliders[2];

  const bgColor = initialColors[index]

  let color = chroma(bgColor)
    .set("hsl.s", sat.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // Colorite inputs/sliders
  colorizeSliders(color, hue, brightness, sat);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  // check contrast
  checkTextContrast(color, textHex);

  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach(slider => {
if(slider.name === 'hue') {
const hueColor = initialColors[slider.getAttribute('data-hue')];
const hueValue = chroma(hueColor).hsl()[0];
slider.value = Math.floor(hueValue);
}
if(slider.name === 'brightness') {
  const brightColor = initialColors[slider.getAttribute('data-bright')];
  const brightValue = chroma(brightColor).hsl()[2];
  slider.value = Math.floor(brightValue * 100) / 100;
  }

  if(slider.name === 'saturation') {
    const satColor = initialColors[slider.getAttribute('data-sat')];
    const satValue = chroma(satColor).hsl()[1];
    slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);

  el.select();
  document.execCommand('copy')

  document.body.removeChild(el);

  // Popup animation
  const popUpBox = popUp.children[0];
  popUp.classList.add('active');
  popUpBox.classList.add('active');
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

randomColors();
