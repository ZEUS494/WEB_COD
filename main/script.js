document.addEventListener("DOMContentLoaded", () => {
    const slidingSection = document.getElementById("sliding-section");
    function openSlidingSection() {
        slidingSection.classList.add("visible");
    }
    setTimeout(openSlidingSection, 1000);
});