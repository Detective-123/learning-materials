const wrapper = document.querySelector('.wrapper');
const question = document.querySelector('.question');
const yesBtn = document.querySelector('.yes');
const noBtn = document.querySelector('.no');

const yesBtnId = document.getElementById('yes');
const noBtnId = document.getElementById('no');

const wrapperRect = wrapper.getBoundingClientRect();
const noBtnRect = noBtn.getBoundingClientRect();
const qRect = question.getBoundingClientRect();

let count = 0;
let count2 = 0;

yesBtn.addEventListener('click', () => {
	count2++;
	if (count2 == 1) {
		question.innerHTML = "I love youu too! hehe😊";
		yesBtn.innerHTML = "Next Page";
	}

	noBtnId.style.display = "none";
	yesBtnId.style.marginLeft = "0";

	createHearts(5);
});

noBtn.addEventListener('click', () => {
	count++;
	const i = Math.floor(Math.random() * (wrapperRect.width - noBtnRect.width)) + 1;
	const j = Math.floor(Math.random() * (wrapperRect.height - noBtnRect.height)) + 1;

	noBtn.style.left = i + 'px';
	noBtn.style.top = j + 'px';

	if (count == 1) {
		question.innerHTML = "Do you really dont?🥹";
	}
	else if (count == 2) {
		question.innerHTML = "Pleasee naaa😭";
	}
	else if (count == 3) {
		question.innerHTML = "Pleaseee Pleaseee 🙏";
	}
	else if (count == 4) {
		question.innerHTML = "Accept or else I will hack u👽";
	}
	else if (count > 4) {
		alert("Congrats! Your laptop is in My control Now!🧑‍💻😎");
	}
});


function createHearts(count) {
	for(let i=0; i < count; i++) {
		const heart = document.createElement("div");
		heart.classList.add("heart");
		heart.innerText = "💖";

		const offset = (Math.random() - 0.5) * 100;

		heart.style.left = `calc(50% + ${offset}px)`;
		heart.style.top = "50%";

		document.body.appendChild(heart);

		setTimeout(() => {
			heart.remove();
		}, 1500);
	}
}