import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
type User = {
  id: number,
  email: string,
  password: string,
  name: string,
  role: "admin" | "customer",
  avatar: string,
  updatedAt: string,
  creationAt: string
}
type PostUser = { name: string, email: string, password: string, avatar: string }
export const usersUrl = "https://api.escuelajs.co/api/v1/users"
const addUser = async (user: PostUser) => {
  return (await axios.post(usersUrl, user)).data as User
}
async function uploadFile(file: File) {
  try {
    const form = new FormData();
    form.append('file', file, file.name);
    const response = await axios.post('https://tmpfiles.org/api/v1/upload', form);
    console.log('File uploaded:', response.data);
    return response
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
  function App() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    axios.get(usersUrl).then(
      (val) => {
        setUsers(val.data.reverse()) //Reverse from first to last ID
        console.log(val.data)
      }
    )
  }, []) //On load only
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File> (); //Base64 pls
  const [image64, setImage64] = useState<string>(""); //Base64 pls
  const [isUploading, setIsUploading] = useState(false);
  const handleImageInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file === null || file === undefined) {
      alert("Unable to handle image to b64")
      return
    }
    console.log(file)
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      setImage64(reader.result as string);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
    setImage(file)
  }
  const handleSubmit = async (e:FormEvent<HTMLFormElement>)=> {
    console.log(e)
    e.preventDefault() // no refresh
    //
    //Check nombre
    if(name.trim() === ""){
      alert("Nombre no puede estar vacio")
      return 
    }
    if (mail.trim() === "") {
      alert("Email no puede estar vacio")
      return
    }
    if(!validateEmail(mail)){
      alert("Email no valido")
        return 
      }
    if (password.trim() === "") {
      alert("Password no puede estar vacio")
      return
    }
    if (!image) {
      alert("Imagen no puede estar vacio")
      return
    }
    //setIsUploading(true) //Load
    const img = await uploadFile(image);
    const imageUrl = img?.data.data.url.split("/") //Image URL splited to add dl
    imageUrl.splice(3,0, "dl" ) 
    console.log(imageUrl.join("/"), "Joined")
    const request = await addUser({name: name, avatar: imageUrl.join("/"), email: mail, password: password})    
    console.log(request, "Final request")
    setUsers([request,...users])
    //Clear data
    setName("")
    setPassword("")
    setImage(undefined)
    setImage64("")
    setMail("")
    //console.log(request)
    setIsUploading(false)
  }
  return (
    <>
      <div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className='inputBox'>
              <label>Nombre</label>
              <input
                type="text"
              value={name} onChange={
                (e) => {
                  setName(e.target.value)
                }
              } />
            </div>
            <div className='inputBox'>
              <label>Correo</label>
              <input 
                type="text"
              value={mail} onChange={
                (e) => {
                  setMail(e.target.value)
                }
              } />
            </div>
            <div className='inputBox'>
              <label>Password</label>
              <input
                
                type='password'
                value={password} onChange={
                  (e) => {
                    setPassword(e.target.value)
                  }
                } />
            </div>
            <div className='inputBox'>
            <label>Avatar</label>
            <input type='file'
              accept='image/*'
              onChange={handleImageInput}
            />
            </div>
            {image64 && (
              <div className='foto'>
                <img src={image64} alt="Uploaded" />
              </div>
            )}
            <button
              disabled={isUploading}
              className='submit'
              type='submit'>Crear</button>
          </form>
        </div>
        <table>
          <thead>
            <tr>
              <td></td>
              <td>
                Correo
              </td>
              <td>
                Nombre
              </td>
              <td>
                Rol
              </td>
              <td>
                Actualizado en
              </td>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              return <tr key={user.id}>
                <td>
                  <img src={user.avatar} />
                </td>
                <td>
                  <p title={user.password}>{user.email}</p>
                </td>
                <td>
                  <p title={String(user.id)}>{user.name}</p>
                </td>
                <td>
                  <p >{user.role}</p>
                </td>
                <td className='time'>
                  <p title={"Creado en " + (toDate(user.creationAt))}>{toDate(user.updatedAt)}</p>
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
function toDate(stringyDate: string) {
  return (new Date(stringyDate)).toLocaleDateString('es-ES')
}
{/* 
export function RowUser(user: User){
  return <tr key={user.id}>
    {Object.keys(user).map(
    (key)=> <td key={Math.random()}>
      {user[key as keyof User]}
      </td>
    )}
  </tr>
} */}
const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export default App
