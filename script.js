document.addEventListener("DOMContentLoaded", () => {
    const slidingSection = document.getElementById("sliding-section");
    function openSlidingSection() {
        slidingSection.classList.add("visible");
    }
    function closeSlidingSection() {
        slidingSection.classList.remove("visible");
    }
    setTimeout(openSlidingSection, 3000);
});