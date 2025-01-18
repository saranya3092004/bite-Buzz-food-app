import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { db } from '../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Slider from 'react-slick';
import './Categories.css';

const CategoriesPage = () => {
  const [marioCategories, setMarioCategories] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [aminetyCategories, setAminetyCategories] = useState([]);

  const storage = getStorage();

  useEffect(() => {
    const fetchCategories = async () => {
      const collections = ['Mariocategories', 'Storecategories', 'Aminetycategories'];
      const categoryFetchPromises = collections.map(async (collectionName) => {
        try {
          const querySnapshot = await getDocs(collection(db, collectionName));
          const categoryList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const updatedCategories = await Promise.all(
            categoryList.map(async (category) => {
              const imagePath = `${category.image}`;
              const imageRef = ref(storage, imagePath);

              try {
                const imageUrl = await getDownloadURL(imageRef);
                return { ...category, imageUrl };
              } catch (error) {
                console.error('Error getting image URL:', error);
                return { ...category, imageUrl: null };
              }
            })
          );

          return { collectionName, updatedCategories };
        } catch (error) {
          console.error('Error fetching categories:', error);
          return { collectionName, updatedCategories: [] };
        }
      });

      const results = await Promise.all(categoryFetchPromises);
      setMarioCategories(results.find(r => r.collectionName === 'Mariocategories').updatedCategories);
      setStoreCategories(results.find(r => r.collectionName === 'Storecategories').updatedCategories);
      setAminetyCategories(results.find(r => r.collectionName === 'Aminetycategories').updatedCategories);
    };

    fetchCategories();
  }, []);

  // Carousel settings
  const settings = {
    dots: true,
    infinite: false, // Prevent the slider from looping
    speed: 500,
    slidesToShow: 7, // Change based on your design
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // Render category cards with slider functionality
  const renderCategoryList = (categories, linkPath) => {
    return (
      <Slider {...settings} className="category-slider">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <Link to={`/category/${linkPath}/${category.name}`} style={{ textDecoration: 'none' }}>
              <img
                src={category.imageUrl || 'https://via.placeholder.com/150'}
                alt={category.name}
                className="category-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <h3>{category.name}</h3>
            </Link>
          </div>
        ))}
      </Slider>
    );
  };

  return (
    <div className="categories-container">
      <div className="category-section">
        <h2>Mario Categories</h2>
        {renderCategoryList(marioCategories, "mario")}
      </div>

      <div className="category-section">
        <h2>Store Categories</h2>
        {renderCategoryList(storeCategories, "store")}
      </div>

      <div className="category-section">
        <h2>Aminety Categories</h2>
        {renderCategoryList(aminetyCategories, "aminety")}
      </div>
    </div>
  );

};

export default CategoriesPage;