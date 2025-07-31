const uploadImage = async (image) => {
const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`;


  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "mern_product"); // preset bạn tạo trên cloudinary

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data; // chứa secure_url, public_id, v.v.
};

export default uploadImage;