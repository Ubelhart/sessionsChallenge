const socket = io.connect();

function renderProducts(products) {
  const html = products
    .map((product) => {
      return `
        <tr>
          <td> ${product.title} </td>
          <td>${product.price}</td>
          <td><img src=${product.thumbnail} /></td>
        </tr>`;
    })
    .join(" ");
  document.getElementById("table").innerHTML = html;
}

socket.on("products", (products) => {
  renderProducts(products);
});

document.getElementById("products").addEventListener("submit", (e) => {
  e.preventDefault();
});

function addProducts() {
  const newProduct = {
    title: document.getElementById("title").value,
    price: document.getElementById("price").value,
    thumbnail: document.getElementById("thumbnail").value,
  };
  socket.emit("new-products", newProduct);
}

function renderMessage(posts) {
  const authorSchema = new normalizr.schema.Entity(
    "authors",
    {},
    { idAttribute: "email" }
  );

  const postSchema = new normalizr.schema.Entity(
    "post",
    {
      author: authorSchema,
    },
    { idAttribute: "_id" }
  );

  const postsSchema = new normalizr.schema.Entity(
    "posts",
    { messages: [postSchema] },
    { idAttribute: "_id" }
  );

  const normalizedData = normalizr.normalize(posts, postsSchema);
  const denormalizedData = normalizr.denormalize(
    normalizedData.result,
    postsSchema,
    normalizedData.entities
  );

  const postsLength = JSON.stringify(posts).length;
  const normalizedDataLength = JSON.stringify(normalizedData).length;

  const compression = (normalizedDataLength / postsLength) * 100;

  console.log(
    "---------------------------- OBJETO ORIGINAL ----------------------------------"
  );
  console.log(posts, postsLength);

  console.log(
    "\n",
    "---------------------------- OBJETO NORMALIZADO ------------------------------"
  );
  console.log(normalizedData, normalizedDataLength);
  console.log(`Porcentaje de compresión ${Math.round(compression)}%`);

  console.log(
    "\n",
    "---------------------------- OBJETO DENORMALIZADO ----------------------------"
  );
  console.log(JSON.stringify(denormalizedData).length);

  document.getElementById(
    "compression"
  ).innerText = `Centro de Mensajes(Compresión: ${Math.round(compression)}%)`;

  const html = posts.messages
    .map((post) => {
      const { author } = post;
      return `<div>
        <strong class="email">${author.email}</strong>
        <em class="date">[${post.date}]</em>:
        <em class="text">${post.message}</em> </div>
        <img src="${author.avatar}"></img>`;
    })
    .join(" ");
  document.getElementById("messages").innerHTML = html;
}

socket.on("messages", (messages) => {
  renderMessage(messages);
});

document.getElementById("chat").addEventListener("submit", (e) => {
  e.preventDefault();
});

function addMessage() {
  const newMessage = {
    author: {
      email: document.getElementById("email").value,
      name: document.getElementById("name").value,
      lastName: document.getElementById("lastName").value,
      age: document.getElementById("age").value,
      alias: document.getElementById("alias").value,
      avatar: document.getElementById("avatar").value,
    },
    message: document.getElementById("message").value,
  };

  socket.emit("new-message", newMessage);
}
