import React, { useState } from 'react'
import styles from "../login/login.module.css"
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useCarrito } from "../../context/CarritoContext"


export default function Login() {
  const { usuario, setUsuario } = useCarrito();
  const navigate = useNavigate();
  const [ loginInputs, setLoginInputs ] = useState({user: "", password: ""});
  const [ alerta, setAlerta ] = useState({ visible: false, mensaje: ""});
  const [ showPassword, setShowPassword ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const users = [
    { user: "hector rodriguez", password: "He123" },
    { user: "espiral", password: 123 }
  ];


  const handleLogin = (e) => {
    e.preventDefault();
    const existeUser = users.find(user => user.user.toString() === loginInputs.user.toLowerCase().toString().trim())
    const existePass = users.find(user => user.password.toString() === loginInputs.password.trim().toString())
    if(loginInputs.user.trim() === "" || loginInputs.password.trim() === ""){
        setAlerta({visible:true, mensaje: "Por favor, llena todos los campos"});
        setTimeout(() => {
          setAlerta({visible: false, mensaje: ""})
        }, 3000);
        return;
    }
    if(!existeUser){
        setAlerta({visible: true, mensaje: "Usuario no encontrado"})
        setTimeout(() => {
          setAlerta({visible:false, mensaje: ""})
        }, 3000);
        return;
    }
    if(!existePass){
      setAlerta({visible:true, mensaje: "Contraseña incorrecta"})
      setTimeout(() => {
        setAlerta({password:false})
      }, 3000);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUsuario(loginInputs.user);
      localStorage.setItem("existeUsuario", "true");
      navigate("/");
    }, 1000);
    
    
  }

  return (
    <div className={styles.login_container}>

      <div className='overlay'></div>
      <form onSubmit={handleLogin} className={styles.login_form} action="">

        <h3>Inicia Sesion</h3>
        {
          loading ? (
            <p className={styles.spinner}><FaSpinner/></p>
          ) : (
          <div className={styles.div_form}>

            <div className={`${styles.div_alerta} ${alerta.visible ? styles.mostrar_alerta : ""}`}>
                {
                  alerta.visible && (
                    <p className={styles.alerta_error}>{alerta.mensaje}</p>
                  )
                }
            </div>
            
            <div className={styles.div_user}>
                <label className={styles.label_user} htmlFor="user"><FaUser/></label>
                <input 
                    value={loginInputs.user}
                    onChange={(e) => setLoginInputs( prevInput => ({
                        ...prevInput,
                        user: e.target.value
                    }))}
                    className={styles.input_user} 
                    id='user' 
                    type="text" 
                    placeholder='Escribe tu usuario' 
                    autoComplete="off"
                />
            </div>
            <div className={styles.div_password}>
                <label className={styles.label_password} htmlFor="password"><RiLockPasswordFill/></label>
                <input 
                    value={loginInputs.password}
                    onChange={(e) => setLoginInputs( prevInput => ({
                        ...prevInput,
                        password: e.target.value.trim()
                    }))}
                    className={styles.input_password} 
                    id='password' 
                    type={showPassword ? "text" : "password"} 
                    placeholder='Escribe tu contraseña'
                />
                {
                  loginInputs.password && (
                      <p onClick={()=>setShowPassword(prev=>!prev)} className={styles.eye}><FaEye/></p>
                  )
                }
            </div>

            
            <button>Iniciar sesion</button>
          </div>
          )
        }
        

      </form>

    </div>
  )
}
