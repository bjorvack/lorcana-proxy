document.addEventListener("DOMContentLoaded", async function () {
    const setsSelect = document.getElementById("sets");
    const showEnchanted = document.getElementById("showEnchanted");
    const showPromo = document.getElementById("showPromo");
    const useGrayscale = document.getElementById("useGrayscale");
    const cardsContainer = document.getElementById("cardsContainer");
    const printButton = document.getElementById("printButton");

    const getSets = async () => {
        const response = await fetch("https://api.lorcast.com/v0/sets");

        return await response.json();
    };

    const addSetsToSelect = async () => {
        const sets = await getSets();

        sets.results.forEach((set) => {
            const optionElement = document.createElement("option");
            optionElement.value = set.code;
            optionElement.textContent = set.name;

            setsSelect.appendChild(optionElement);
        });

        // Select the first set by default
        setsSelect.selectedIndex = 1;
        await renderSet(sets.results[0].code);

        setsSelect.classList.remove("hidden");
    };

    const renderSet = async (code) => {
        const response = await fetch(
            `https://api.lorcast.com/v0/sets/${code}/cards`
        );
        const cards = await response.json();

        let fullGrayscale = false;
        if (code === "cp" || code === "D23") {
            fullGrayscale = true;
        }

        const showEnchantedCards = showEnchanted.checked;
        const showPromoCards = showPromo.checked;
        const useGrayscaleCards = useGrayscale.checked;

        cards.forEach((card) => {
            if (!showEnchantedCards && card.rarity === "Enchanted") {
                return;
            }

            if (!showPromoCards && card.rarity === "Promo") {
                return;
            }

            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            if (card.type.includes("Location")) {
                cardElement.classList.add("location");
            }

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "x";
            deleteButton.classList.add("delete-button");
            deleteButton.classList.add("display-only");

            const imgElement = document.createElement("img");
            imgElement.src = card.image_uris.digital.large;
            cardElement.appendChild(imgElement);

            if (useGrayscaleCards) {
                const grayscaleMask = document.createElement("div");
                grayscaleMask.classList.add("grayscale-mask");


                if (fullGrayscale || card.rarity === "Enchanted" || card.rarity === "Iconic") {
                    grayscaleMask.classList.add("full-grayscale-mask");
                }

                const grayscaleImg = document.createElement("img");
                grayscaleImg.src = card.image_uris.digital.large;

                grayscaleMask.appendChild(grayscaleImg);
                cardElement.appendChild(grayscaleMask);
            }

            cardElement.appendChild(deleteButton);
            cardsContainer.appendChild(cardElement);

            cardElement.addEventListener("click", () => {
                // Remove the card from the container
                cardElement.remove();
            });
        });
    };

    printButton.addEventListener("click", () => {
        window.print();
    });

    const selectSet = async () => {
        const selectedSet = setsSelect.value;

        // Clear the cards container
        cardsContainer.innerHTML = "";

        if (selectedSet === "") {
            return;
        }

        await renderSet(selectedSet);
    };

    showEnchanted.addEventListener("change", selectSet);

    showPromo.addEventListener("change", selectSet);

    setsSelect.addEventListener("change", selectSet);

    useGrayscale.addEventListener("change", selectSet);

    await addSetsToSelect().then(() => selectSet());
});