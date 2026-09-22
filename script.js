/*barra de navegacion*/  
/*aignamos variables*/ 
const menuBtn = document.querySelector('.menu-btn');
const navlinks = document.querySelector('.nav-links');
const links = navlinks.querySelectorAll('a');


/*cada que el usuario clickee el menu se activa el boton*/
menuBtn.addEventListener('click', () => {
    navlinks.classList.toggle('active');
    
    /*si la barra esta activa, el icono cambiara y se expandera la lista con los enlaces*/
        if (navlinks.classList.contains('active')) {
        menuBtn.innerHTML = "✕";
        menuBtn.setAttribute("aria-expanded", "true");
     } else {
        /*si no simplemente mantendra el icono original*/ 
        menuBtn.innerHTML = "☰";
        menuBtn.setAttribute("aria-expanded", "false");
     }
    });

    /*cada que se clickee un enlace, se removera el menu y regresara a tu estado original*/
links.forEach(link => {
    link.addEventListener('click', () => {
        navlinks.classList.remove('active');
        menuBtn.innerHTML = "☰";
        menuBtn.setAttribute("aria-expanded", "false");
    })
});

/*imodo oscuro*/
const botonluna = document.getElementById('botonluna');
botonluna.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    if (document.body.classList.contains('modo-oscuro')) {
    }
});
