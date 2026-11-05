document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".question-form");
  const update = () => {
    const total = document.querySelectorAll(".question-card-smooth").length;
    const count = form.querySelectorAll('input[type="radio"]:checked').length;
    document.querySelector(".question-progress-fill").style.width = `${count / total * 100}%`;
    document.getElementById("questionProgress").textContent = `${count} / ${total} answered`;
  };
  form.addEventListener("change", update);
  update();
});
