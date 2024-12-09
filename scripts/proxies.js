document.addEventListener("DOMContentLoaded", async function () {
    const cardsContainer = document.getElementById("cardsContainer");
    const cardSelectionContainer = document.getElementById("cardSelectionContainer");
    const searchQueryInput = document.getElementById("searchQuery");
    const searchContainer = document.getElementById("searchContainer");
    const addCardButton = document.getElementById("addCardButton");
    const printButton = document.getElementById("printButton");

    let proxiedCards = [];

    printButton.addEventListener("click", () => {
        window.print();
    });

    addCardButton.addEventListener("click", async () => {
        searchContainer.showModal()
    })

    searchContainer.querySelector('[data-role=close]').addEventListener('click', () => {
        searchContainer.close()
        searchQueryInput.value = ""
        cardSelectionContainer.innerHTML = "";
    })

    const addCardToContainer = (card, container) => {
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
        cardElement.appendChild(deleteButton);
        container.appendChild(cardElement);

        cardElement.addEventListener("click", () => {
            // Remove a single instance off the card in the proxied cards
            const index = proxiedCards.findIndex(c => c.id === card.id);
            proxiedCards.splice(index, 1);

            // Remove the card from the container
            cardElement.remove();
        });
    }

    const renderCards = () => {
        // sort cards by name and id
        const sortedCards = proxiedCards.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return a.id - b.id;
        });

        cardsContainer.innerHTML = "";
        sortedCards.forEach((card) => {
            addCardToContainer(card, cardsContainer)
        });
    }

    // Cache the latest search query
    let currentSearchQuery = "";
    searchQueryInput.addEventListener("input", async () => {
       const searchQuery = searchQueryInput.value;
       currentSearchQuery = searchQuery;
       fetch(`https://api.lorcast.com/v0/cards/search?q=${searchQuery}`)
          .then(response => response.json())
          .then(data => {
            if (currentSearchQuery !== searchQuery) {
                return;
            }

            cardSelectionContainer.innerHTML = "";

            const cards = data.results;
            cards.forEach((card) => {
                const cardElement = document.createElement("div");
                let cardCount = proxiedCards.filter(c => c.id === card.id).length;
                cardElement.classList.add("card");
                if (card.type.includes("Location")) {
                    cardElement.classList.add("location");
                }

                const imgElement = document.createElement("img");
                imgElement.src = card.image_uris.digital.large;


                const cardCountElement = document.createElement("h2");
                cardCountElement.classList.add("card-count");
                cardCountElement.textContent = cardCount;

                cardElement.appendChild(cardCountElement);
                cardElement.appendChild(imgElement);
                cardSelectionContainer.appendChild(cardElement);
                cardElement.addEventListener("click", () => {
                    proxiedCards.push(card);

                    cardCount++;
                    cardCountElement.textContent = cardCount;

                    addCardToContainer(card, cardsContainer);
                });
            });
              });
    });
})