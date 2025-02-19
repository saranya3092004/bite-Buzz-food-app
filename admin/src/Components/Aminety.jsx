import React, { useState, useEffect } from "react";
import "./Aminety.css";
import { db, storage } from "../firebase.config"; // Import your firebase configuration
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { getStorage, deleteObject } from "firebase/storage";
import { motion,AnimatePresence } from "framer-motion";

const Aminety = () => {
  const [view, setView] = useState("Aminetycategories");
  const [Aminetycategories, setCategories] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [Aminetyitems, setItems] = useState([]);
  const [itemImage, setItemImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);


  const [topSaleItems, setTopSaleItems] = useState([]);

// 1. Fetch Top Sale Items
const fetchTopSaleItems = async () => {
  const querySnapshot = await getDocs(collection(db, "topSale"));
  const fetchedTopSaleItems = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    firestoreId: doc.id,  // Aminety the Firestore document ID for deletion
  }));
  setTopSaleItems(fetchedTopSaleItems);
};


// 2. Add Item to Top Sale
const handleAddToTopSale = async (item) => {
  try {
    // Check if the topSaleItems list has reached the limit
    if (topSaleItems.length >= 9) {
      alert("You can only add up to 9 items to Top Sale.");
      return;
    }

    // Add the item to the topSale collection in Firestore with the original item.id
    const docRef = await addDoc(collection(db, "topSale"), {
      ...item,
      originalId: item.id, // Store the original item's ID for reference
    });

    console.log("Item successfully added to Firestore topSale collection");

    // Update the local topSaleItems state with the new item and its Firestore ID
    setTopSaleItems((prevTopSaleItems) => [
      ...prevTopSaleItems,
      { ...item, firestoreId: docRef.id }, // Include the Firestore document ID
    ]);
  } catch (error) {
    console.error("Error adding item to Top Sale:", error);
  }
};


// 3. Remove Item from Top Sale
// Function to remove item from Top Sale collection in Firestore by document ID
const handleRemoveFromTopSale = async (firestoreId) => {
  try {
    await deleteDoc(doc(db, "topSale", firestoreId));
    setTopSaleItems((prevTopSaleItems) =>
      prevTopSaleItems.filter((item) => item.firestoreId !== firestoreId)
    );
  } catch (error) {
    console.error("Error removing item from top sale:", error);
  }
};



// Call fetchTopSaleItems on component mount or as needed
useEffect(() => {
  fetchTopSaleItems();
}, []);
 
  // Upload file to Firebase Storage and return the download URL
  const uploadImage = async (file) => {
    const storageRef = ref(storage, `Aminetyimages/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (categoryName && categoryImage) {
      const imageUrl = await uploadImage(categoryImage); // Upload image and get URL
      const newCategory = {
        name: categoryName,
        image: imageUrl, // Save the URL
      };
      await addDoc(collection(db, "Aminetycategories"), newCategory);
      resetCategoryForm();
    }
  };

  // Fetch Aminetycategories from Firestore on component mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Aminetycategories"), (snapshot) => {
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Handle setting the active category to display Aminetyitems
  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
  };

  // Handle clicking the edit button for Aminetycategories
  const handleEditCategoryClick = (id) => {
    const categoryToEdit = Aminetycategories[id];
    setCategoryName(categoryToEdit.name);
    setCategoryImage(null); // Keep it null to not retain the old image
    setEditCategoryIndex(id); // Set the id of the category to be edited
    setView("addCategory"); // Show the form for editing the category
  };

  // Handle editing an existing category
  const handleEditCategory = async () => {
    if (editCategoryIndex !== null) {
      const currentCategory = Aminetycategories[editCategoryIndex]; // Get the current category being edited

      // Prepare the updated category data
      const updatedCategory = {
        name: categoryName,
      };

      try {
        // Check if a new image is being uploaded
        if (categoryImage) {
          // Extract and decode the current image filename from the URL
          const currentImageFileName = decodeURIComponent(
            currentCategory.image.split("/").pop().split("?")[0]
          ); // Decode to prevent double encoding
          const currentImageRef = ref(storage, `${currentImageFileName}`);

          // Delete the existing image from Firebase Storage
          await deleteObject(currentImageRef);
          console.log("Existing category image deleted from Firebase Storage");

          // Upload the new image to Firebase Storage
          const newImageRef = ref(storage, `Aminetyimages/${categoryImage.name}`);
          await uploadBytes(newImageRef, categoryImage);
          console.log("New category image uploaded to Firebase Storage");

          // Get the download URL of the newly uploaded image
          const newImageUrl = await getDownloadURL(newImageRef);
          updatedCategory.image = newImageUrl; // Set the new image URL
        } else {
          // Retain the old image if no new image is provided
          updatedCategory.image = currentCategory.image;
        }

        // Update the category in Firestore with the new data
        const categoryRef = doc(db, "Aminetycategories", currentCategory.id);
        await updateDoc(categoryRef, updatedCategory);
        console.log("Category successfully updated in Firestore");

        // Reset the form and view
        resetCategoryForm();
        setEditCategoryIndex(null);
        setView("Aminetycategories"); // Return to Aminetycategories view
      } catch (error) {
        console.error("Error editing category:", error);
      }
    }
  };

  // Reset the category form state
  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryImage(null);
    setView("Aminetycategories"); // Go back to Aminetycategories view
  };

  // Handle removing a category and all related Aminetyitems
  const handleRemoveCategory = async (categoryToRemove) => {
    const confirmation = window.confirm(
      `Are you sure you want to delete the category "${categoryToRemove.name}" and all its Aminetyitems?`
    );

    if (confirmation) {
      // Fetch all Aminetyitems in this category
      const AminetyitemsRef = collection(db, "Aminetyitems");
      const q = query(AminetyitemsRef, where("category", "==", categoryToRemove.name));
      const AminetyitemsSnapshot = await getDocs(q);

      // Delete each item and its image in this category
      const deletePromises = AminetyitemsSnapshot.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        if (itemData.image) {
          // Properly extract image filename from Firebase Storage URL
          const itemImageUrl = new URL(itemData.image);
          const itemImagePath = decodeURIComponent(
            itemImageUrl.pathname.split("/o/")[1]
          ); // Get correct path after '/o/'

          const itemImageRef = ref(storage, itemImagePath);
          await deleteObject(itemImageRef); // Delete item image from Firebase Storage
        }
        await deleteDoc(doc(db, "Aminetyitems", itemDoc.id)); // Delete item from Firestore
      });

      // Wait for all Aminetyitems to be deleted
      await Promise.all(deletePromises);

      // Delete the category image from Firebase Storage
      if (categoryToRemove.image) {
        // Properly extract category image filename from Firebase Storage URL
        const categoryImageUrl = new URL(categoryToRemove.image);
        const categoryImagePath = decodeURIComponent(
          categoryImageUrl.pathname.split("/o/")[1]
        ); // Get correct path after '/o/'

        const categoryImageRef = ref(storage, categoryImagePath);
        await deleteObject(categoryImageRef); // Delete category image from Firebase Storage
      }

      // Delete the category itself from Firestore
      const categoryRef = doc(db, "Aminetycategories", categoryToRemove.id);
      await deleteDoc(categoryRef);

      console.log(
        `Category ${categoryToRemove.name} and its Aminetyitems were successfully deleted.`
      );
    }
  };

  // Fetch Aminetyitems from Firestore on component mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Aminetyitems"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Handle adding a new item
  const handleAddItem = async () => {
    if (foodName && selectedCategory && price && quantity && itemImage) {
      try {
        const imageUrl = await uploadImage(itemImage); // Upload image and get URL
        const newItem = {
          name: foodName,
          category: selectedCategory,
          price: Number(price), // Convert price to number
          quantity: Number(quantity), // Convert quantity to integer
          image: imageUrl, // Save the URL
        };
        
        // Add the new item to Firestore
        await addDoc(collection(db, "Aminetyitems"), newItem);
        console.log("Item successfully added.");
  
        // Reset the form after adding the item

        resetItemForm();
      } catch (error) {
        console.error("Error adding item:", error);
        alert("Failed to add item. Please try again.");
      }
    } else {
      alert("Please fill in all fields and upload an image.");
    }
  };
  

  // Handle clicking the edit button to populate the form with existing data
  const handleEditButtonClick = (id) => {
    const itemToEdit = Aminetyitems.find((item) => item.id === id);
    if (itemToEdit) {
      setFoodName(itemToEdit.name);
      setPrice(itemToEdit.price);
      setQuantity(itemToEdit.quantity);
      setSelectedCategory(itemToEdit.category);
      setItemImage(null);
      setEditItemIndex(Aminetyitems.findIndex((item) => item.id === id));
      setView("addItem");
    }
  };
  

  // Handle editing an existing item
  const handleEditItem = async () => {
    if (editItemIndex !== null) {
      const currentItem = Aminetyitems[editItemIndex]; // Get the current item being edited
  
      // Prepare the updated item data with numeric values
      const updatedItem = {
        name: foodName,
        price: Number(price), // Ensure price is stored as a number
        quantity: Number(quantity), // Ensure quantity is stored as a number
      };
  
      try {
        // Check if a new image is being uploaded
        if (itemImage) {
          // Extract and decode the current image filename from the URL
          const currentImageFileName = decodeURIComponent(
            currentItem.image.split("/").pop().split("?")[0]
          ); // Decode to prevent double encoding
          const currentImageRef = ref(storage, `${currentImageFileName}`);
  
          // Delete the existing image from Firebase Storage
          await deleteObject(currentImageRef);
          console.log("Existing image deleted from Firebase Storage");
  
          // Upload the new image to Firebase Storage
          const newImageRef = ref(storage, `Aminetyimages/${itemImage.name}`);
          await uploadBytes(newImageRef, itemImage);
          console.log("New image uploaded to Firebase Storage");
  
          // Get the download URL of the newly uploaded image
          const newImageUrl = await getDownloadURL(newImageRef);
          updatedItem.image = newImageUrl; // Set the new image URL
        } else {
          // Retain the old image if no new image is provided
          updatedItem.image = currentItem.image;
        }
  
        // Update the item in Firestore with the new data
        const itemRef = doc(db, "Aminetyitems", currentItem.id);
        await updateDoc(itemRef, updatedItem);
        console.log("Item successfully updated in Firestore");
  
        // Check and update the corresponding item in the topSale collection
        const topSaleQuery = query(
          collection(db, "topSale"),
          where("originalId", "==", currentItem.id)
        );
        const topSaleSnapshot = await getDocs(topSaleQuery);
  
        if (!topSaleSnapshot.empty) {
          topSaleSnapshot.forEach(async (doc) => {
            const topSaleRef = doc.ref; // Reference to the document
            await updateDoc(topSaleRef, updatedItem); // Update the document
            console.log("Item successfully updated in topSale collection");
          });
        } else {
          console.log("Item not found in topSale collection");
        }
  
        // Reset the form and edit id
        resetItemForm();
        setEditItemIndex(null);
      } catch (error) {
        console.error("Error editing item:", error);
      }
    }
  };
  
  // Reset the item form state
  const resetItemForm = () => {
    setFoodName("");
    setSelectedCategory("");
    setPrice("");
    setQuantity("");
    setItemImage(null);
    setView("Aminetycategories");
  };
  
  

  // Handle removing an item
  const handleRemoveItem = async (itemToRemove) => {
    const confirmation = window.confirm(
      `Are you sure you want to delete the item "${itemToRemove.name}"?`
    );

    if (confirmation) {
      // Check if the item has an associated image
      if (itemToRemove.image) {
        try {
          // Log the image URL for debugging
          console.log("Image URL:", itemToRemove.image);

          // Extract the image filename directly from the URL
          const decodedUrl = decodeURIComponent(itemToRemove.image); // Decode URL in case it's encoded
          const itemImageFileName = decodedUrl.split("/o/")[1].split("?")[0]; // Extract the filename

          // Log the extracted filename to ensure it's correct
          console.log("Extracted Image Filename:", itemImageFileName);

          // Use the correct path to reference the image in Firebase Storage
          const itemImageRef = ref(storage, `${itemImageFileName}`);

          // Attempt to delete the item image from Firebase Storage
          await deleteObject(itemImageRef);
          console.log("Item image successfully deleted from Firebase Storage");
        } catch (error) {
          console.error(
            "Error deleting item image from Firebase Storage:",
            error
          );
        }
      }

      try {
        // Delete the item from Firestore
        const itemRef = doc(db, "Aminetyitems", itemToRemove.id);
        await deleteDoc(itemRef);
        console.log("Item successfully deleted from Firestore");
      } catch (error) {
        console.error("Error deleting item from Firestore:", error);
      }
    }
  };

  return (

    <div className="Aminety-container">
  <h1>Aminety</h1>
  <div className="Aminety-buttons">
    <button onClick={() => setView("Aminetycategories")}>Categories</button>
    <button onClick={() => setView("addItem")}>Add Item</button>
    <button onClick={() => setView("addCategory")}>Add New Category</button>
  </div>

  {/* Add Item Section */}
  {view === "addItem" && (
    <div className="add-item-section">
      <h3>{editItemIndex !== null ? "Edit Item" : "Add Item"}</h3>
      <input
        type="text"
        placeholder="Food Name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {Aminetycategories.map((cat, id) => (
          <option key={id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="number"
        placeholder="Total Available Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setItemImage(e.target.files[0])}
      />
      <button
        onClick={editItemIndex !== null ? handleEditItem : handleAddItem}
      >
        {editItemIndex !== null ? "Update Item" : "Add Item"}
      </button>
    </div>
  )}

  {/* Add Category Section */}
  {view === "addCategory" && (
    <div className="add-category-section">
      <h3>
        {editCategoryIndex !== null ? "Edit Category" : "Add Category"}
      </h3>
      <input
        type="text"
        placeholder="Category Name"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCategoryImage(e.target.files[0])}
      />
      <button
        onClick={
          editCategoryIndex !== null
            ? handleEditCategory
            : handleAddCategory
        }
      >
        {editCategoryIndex !== null ? "Update Category" : "Add Category"}
      </button>
    </div>
  )}

  {/* Categories Section */}
  {view === "Aminetycategories" && (
    <div className="Aminetycategories-section">
      <h3>Categories</h3>
      <div className="Aminetycategories-list">
        {Aminetycategories.map((cat, id) => (
          <div key={cat.id} className="category-card">
            <img src={cat.image} alt={cat.name} />
            <h4>{cat.name}</h4>
            <div className="button-container">
            <button onClick={() => handleEditCategoryClick(id)}>Edit</button>
            <button onClick={() => handleRemoveCategory(cat)}>Delete</button>
            <button onClick={() => handleCategoryClick(cat.name)}>
              View Items
            </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

<AnimatePresence>
  {/* Items in Noodles Section */}
  {activeCategory && (
  <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ duration: 0.5 }}
    className="Aminetyitems-overlay"
  >
    <button
      className="close-overlay"
      onClick={() => setActiveCategory(null)}
    >
      &times;
    </button>
    <h3>Items in {activeCategory}</h3>
    <div className="Aminetyitems-list">
      {Aminetyitems
        .filter((item) => item.category === activeCategory)
        .map((item) => (
          <div key={item.id} className="Aminety-item-card">
            <img src={item.image} alt={item.name} />
            <h4>{item.name}</h4>
            <p>Price: {item.price}</p>
            <p>Quantity: {item.quantity}</p>
            <div className="button-container">
            <button onClick={() => handleEditButtonClick(item.id)}>
              Edit
            </button>
            <button onClick={() => handleRemoveItem(item)}>Delete</button>
            <motion.div whileTap={{ scale: 0.9 }}>
            <button
  onClick={() => handleAddToTopSale(item)}
  disabled={
    topSaleItems.some((topSaleItem) => topSaleItem.originalId === item.id) || 
    topSaleItems.length >= 9
  }
>
  Add to Top Sale
</button>

            </motion.div>
            </div>
          </div>
        ))}
    </div>
  </motion.div>
)}
</AnimatePresence>


  {/* Top Sale of the Week Section */}
  {topSaleItems.length > 0 && (
    <div className="top-sale-section">
      <h3>Top Sale of the Week</h3>
      <div className="top-sale-list">
        {topSaleItems.map((item) => (
          <div key={item.id} className="top-sale-card">
            <img src={item.image} alt={item.name} />
            <h4>{item.name}</h4>
            <motion.div whileTap={{ scale: 0.9 }}>
              <button onClick={() => handleRemoveFromTopSale(item.firestoreId)}>
                Remove from Top Sale
              </button>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

  );
};

export default Aminety;
