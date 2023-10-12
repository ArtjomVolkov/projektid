import { useEffect, useRef, useState } from 'react';
import { Document, Page, Text, Image,pdf, View, StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import './App.css';

function App() {
  //---------Всё для pood---------
  const [poed, setPoed] = useState([]);
  const [filtritudPoed, setFiltritudPoed] = useState([]);
  const nimiRef = useRef(); //pood.nimi
  const avamineRef = useRef(); //pood.avamine
  const sulgemineRef = useRef(); //pood.sulgemine
  //---------Фильтр---------
  const filterRef = useRef();
  //---------Проверка на время работы магазинов---------
  const [valitudAeg, setValitudAeg] = useState("");
  const [avatudPoed, setAvatudPoed] = useState([]);
  //---------Продукты магазина---------
  const [products, setProducts] = useState([]);
  //---------Сортировка магазинов---------
  const [sortDirectionNimi, setSortDirectionNimi] = useState('asc');
  const [sortDirectionAvamine, setSortDirectionAvamine] = useState('asc');
  const [sortDirectionSulgemine, setSortDirectionSulgemine] = useState('asc');
  const [sortDirectionKuulastuste, setSortDirectionKuulastuste] = useState('asc');
  //---------Модальное окно---------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  //---------Корзина товаров---------
  const [cart, setCart] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const openCartModal = () => {
    setIsCartModalOpen(true);
  }
  //---------Проходит оплата или нет---------
  const [PaymentConfirmation, setPaymentConfirmation] = useState(false);
  const PaymentConfirmations = (confirmPayment) => {
    if (confirmPayment) {
      const total = calculateTotalPrice(cart);
      makePayment(total);
      setCart([]);
    }
    setPaymentConfirmation(false);
  };

  useEffect(() => {
    fetch("https://localhost:7056/api/Poodidi")
      .then((res) => res.json())
      .then((json) => {
        setPoed(json);
        setFiltritudPoed(json);
      });
  }, []);
  
  //---------Добавление посетителей в определенный магазин---------
  function kylasta(poodiNimi) {
    var pood = poed.find((p) => p.nimi === poodiNimi); //пойск магазинов
    if (pood !== undefined) {
      fetch(`https://localhost:7056/api/Poodidi/kylasta/${pood.nimi}`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          pood.kuulastusteArv = data; // Обновление количество посетителей
          setPoed([...poed]); // Обновление новых данных
        });
    }
  }
  
  //---------Добавление нового магазина---------
  function lisaPood() {
    //---------Создаем объект---------
    const uusPood = {
      nimi: nimiRef.current.value,          //Название магазина
      avamine: avamineRef.current.value,    //Время открытия
      sulgemine: sulgemineRef.current.value, //Время закрытия
      kuulastusteArv: 0,                    //Количество посетителей
    };
    fetch("https://localhost:7056/api/Poodidi/lisa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uusPood),
    })
      .then((res) => res.json()) 
      .then((json) => {
        setPoed(json); //Обновление списка всех магазинов
        setFiltritudPoed(json); //Обновление списка отфильтрованных магазинов
      });
  
    //---------Отчистка формы заполнения---------
    nimiRef.current.value = "";
    avamineRef.current.value = "";
    sulgemineRef.current.value = "";
  }

  //---------Удаление магазина---------
  function kustutaPood(id) {
    fetch("https://localhost:7056/api/Poodidi/kustuta/" + id, { method: "DELETE" })
        .then((res) => res.json())
        .then((json) => {
            setPoed(json);
            setFiltritudPoed(json);
        });
  }

  //---------Пойск магазина по имени---------
  function filtreeriPoed() {
    //Получаемый текст из поля фильтр образуем в нижний регистр
    const filterTekst = filterRef.current.value.toLowerCase();
    //Фильтр магазина
    const filtreeritud = poed.filter((pood) =>
      pood.nimi.toLowerCase().includes(filterTekst)
    );
    //Новый список магазинов, соответствующий фильтру
    setFiltritudPoed(filtreeritud);
  }

  //---------Операция платежа---------
  async function makePayment() {
    try {
      const total = calculateTotalPrice(cart);
      const response = await fetch(`https://localhost:7056/Payment/${total}`);
      if (response.ok) {
        let paymentLink = await response.text();
        // Удаляем начальные и конечные двойные кавычки
        paymentLink = paymentLink.replace(/^"|"$/g, '');
        window.open(paymentLink, '_blank'); // Открыть ссылку в новой вкладке
      } else {
        console.error('Payment failed.');
      }
    } catch (error) {
      console.error('Error making payment:', error);
    }
  }

  //---------Запрос товаров из API и отображение в модальном окне---------
  async function modalwindow() {
    try {
      //Получаем случайное число от 1 до 5 для выбора страницы товаров
      const nrd = Math.floor(Math.random()*5)+1;
      const response = await fetch(`https://api.storerestapi.com/products?limit=4&page=${nrd}`);
      if (response.ok) {
      const data = await response.json();
      const productsData = data.data;
      //Проверка есть ли товары
      if (productsData.length === 0) {
        alert('Selles poes ei ole tooteid.');
      } else {
        setProducts(productsData);
        setSelectedProducts(productsData); // Сохраняем выбранные товары
        setIsModalOpen(true);
      }
    } else {
      //Ошибка в консоль
      console.error('Viga kauba kättesaamisel.');
    }
  } catch (error) {
    //Ошибка при обработе данных в консоль
    console.error('Viga kauba kättesaamisel:', error);
  }
  }

  //---------Открывается диалоговое окно, где пользователю предлагается ввести время в формате HH:MM---------
  function naitaAvatudPoed() {
    const valitudAegStr = prompt("Sisesta aeg (HH:MM):"); //Показывает диалоговое окно для ввода времени

    // Проверка, было ли введено время
    if (!valitudAegStr) {
        alert("Aeg ei ole sisestatud."); // Если время не было введено, выдаём сообщение ошибки и завершаем функцию
        return;
    }

    // Разбиваем введенное время на часы и минуты
    const [tundStr, minutStr] = valitudAegStr.split(":");
    const tund = parseInt(tundStr, 10);
    const minut = parseInt(minutStr, 10);

    // Проверка корректности формата введенного времени
    if (isNaN(tund) || isNaN(minut)) {
        alert("Vale aja formaat. Sisesta aeg kujul HH:MM."); // Если формат времени неверный, выводим сообщение ошибки и завершаем функцию
        return;
    }

    // Выполняем запрос к серверу, чтобы получить список открытых магазинов в указанное время
    fetch(`https://localhost:7056/api/Poodidi/lahtipood/${tund}/${minut}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Network response was not ok (Status: ${res.status})`);
            }
            return res.json();
        })
        .then((data) => {
            // Если есть открытые магазины, сохраняем их в состояние
            if (data.length > 0) {
                setAvatudPoed(data);
            } else {
                alert("Ühtegi poodi pole sel ajal lahti."); // Если магазины закрыты, выводим сообщение
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("Error."); // Вывод сообщения об ошибке
        });
  }

  //---------Показывает списком открытые магазины в определенное время---------
  function renderAvatudPoed() {
  if (avatudPoed.length > 0) {
      // Если есть открытые магазины, создаем список
      return (
          <div className="avatud-poed">
              <h2>Avatud poed:</h2>
              <ul className="avatud-poed-list">
                  {avatudPoed.map((pood, index) => (
                      <li key={index} className="avatud-pood-item">
                          {pood}
                      </li>
                  ))}
              </ul>
          </div>
      );
  } else if (valitudAeg && avatudPoed.length === 0) {
      // Если временной интервал выбран, но нет открытых магазинов, выводим сообщение об отсутствии открытых магазинов
      return <p className="avatud-poed-empty">Ühtegi poodi pole sel ajal lahti.</p>;
  } else {
      // В остальных случаях (когда временной интервал не выбран), возвращаем пустое значение
      return null;
  }
}

  //---------Стили для распечатки---------
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: 'white',
      padding: 10,
    },
    content: {
      flexGrow: 1,
    },
    header: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 10,
    },
    datetime: {
      fontSize: 12,
      position: 'absolute',
      top: 10,
      right: 80,
    },
    image: {
      width: 140,
      height: 100,
      position: 'absolute',
      top: 10,
      left: 10,
    },
    table: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 70, // Отступ от верхней части страницы
      width: '80%', // Ширина таблицы
      border: '1px',
      bordercorner: '2px',
      padding: '5px',
    },
  });

  //---------Распечатка PDF---------
  function generatePDF(poed) {
    // Получаем текущую дату и время
    const currentDate = new Date().toLocaleString();

    // Создаем структуру PDF-документа с использованием библиотеки React-PDF
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.datetime}>{currentDate}</Text>
          <Image style={styles.image} src="firm.jpg" />
          <View style={styles.content}>
            <Text style={styles.header}>Külastaja väljatrükk</Text>
            <View style={styles.table}>
              {poed.map((pood, index) => (
                <View key={index}>
                  <Text>Pood: {pood.nimi}</Text>
                  <Text>Tööaeg: {pood.avamine} - {pood.sulgemine}</Text>
                  <Text>KuulastusteArv: {pood.kuulastusteArv}</Text>
                  <Text> </Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  //---------Сохранение PDF файла------------------
  function printPDF(poed, filename) {
    // Проверяем, что есть данные для печати (магазины)
    if (poed.length > 0) {
        // Генерируем содержимое PDF-документа, используя функцию generatePDF
        const pdfContent = generatePDF(poed);
  
        // Преобразуем содержимое PDF в Blob
        pdf(pdfContent)
            .toBlob()
            .then((blob) => {
                // Создаем URL для Blob
                const url = URL.createObjectURL(blob);
                // Открываем новое окно браузера для печати PDF
                const printWindow = window.open(url);
            });
    } else {
        // Если нет данных для печати, выводим сообщение об ошибке
        alert("Error.");
    }
}

  //---------Сортировка магазинов по полю Nimi---------
  function sortPoedByNimi() {
    const sortedPoed = [...filtritudPoed];
    if (sortDirectionNimi === 'asc') {
      // Сортировка по возрастанию (asc) по полю Nimi
      sortedPoed.sort((a, b) => a.nimi.localeCompare(b.nimi));
      setSortDirectionNimi('desc'); // Устанавливаем направление сортировки на убывание
    } else {
      // Сортировка по убыванию (desc) по полю Nimi
      sortedPoed.sort((a, b) => b.nimi.localeCompare(a.nimi));
      setSortDirectionNimi('asc'); // Устанавливаем направление сортировки на возрастание
    }
    setFiltritudPoed(sortedPoed); // Устанавливаем отсортированный список магазинов
  }

  //---------Сортировка магазинов по полю Avamine---------
  function sortPoedByAvamine() {
    const sortedPoed = [...filtritudPoed];
    if (sortDirectionAvamine === 'asc') {
      // Сортировка по возрастанию (asc) по полю Avamine
      sortedPoed.sort((a, b) => a.avamine.localeCompare(b.avamine));
      setSortDirectionAvamine('desc'); // Устанавливаем направление сортировки на убывание
    } else {
      // Сортировка по убыванию (desc) по полю Avamine
      sortedPoed.sort((a, b) => b.avamine.localeCompare(a.avamine));
      setSortDirectionAvamine('asc'); // Устанавливаем направление сортировки на возрастание
    }
    setFiltritudPoed(sortedPoed); // Устанавливаем отсортированный список магазинов
  }

  //---------Сортировка магазинов по полю Sulgemine---------
  function sortPoedBySulgemine() {
    const sortedPoed = [...filtritudPoed];
    if (sortDirectionSulgemine === 'asc') {
      // Сортировка по возрастанию (asc) по полю Sulgemine
      sortedPoed.sort((a, b) => a.sulgemine.localeCompare(b.sulgemine));
      setSortDirectionSulgemine('desc'); // Устанавливаем направление сортировки на убывание
    } else {
      // Сортировка по убыванию (desc) по полю Sulgemine
      sortedPoed.sort((a, b) => b.sulgemine.localeCompare(a.sulgemine));
      setSortDirectionSulgemine('asc'); // Устанавливаем направление сортировки на возрастание
    }
    setFiltritudPoed(sortedPoed); // Устанавливаем отсортированный список магазинов
  }

  //---------Сортировка магазинов по полю Kuulastuste---------
  function sortPoedByKuulastuste() {
    const sortedPoed = [...filtritudPoed];
    if (sortDirectionKuulastuste === 'asc') {
      // Сортировка по возрастанию (asc) по полю Kuulastuste
      sortedPoed.sort((a, b) => a.kuulastusteArv - b.kuulastusteArv);
      setSortDirectionKuulastuste('desc'); // Устанавливаем направление сортировки на убывание
    } else {
      // Сортировка по убыванию (desc) по полю Kuulastuste
      sortedPoed.sort((a, b) => b.kuulastusteArv - a.kuulastusteArv);
      setSortDirectionKuulastuste('asc'); // Устанавливаем направление сортировки на возрастание
    }
    setFiltritudPoed(sortedPoed); // Устанавливаем отсортированный список магазинов
  }

  function addToCart(product) {
    alert("Toode lisatud ostukorvi");
    setCart([...cart, product]);
  }
  
  function removeFromCart(product) {
  const itemIndex = cart.findIndex((item) => item.id === product.id);
  if (itemIndex !== -1) {
    // Создайте новый массив корзины, исключая элемент с заданным индексом
    const updatedCart = [...cart.slice(0, itemIndex), ...cart.slice(itemIndex + 1)];
    setCart(updatedCart);
  }
  alert("Toode kustatud");
}

  function calculateTotalPrice(cart) {
    return cart.reduce((total, product) => total + product.price, 0);
  }
  

  return (
    <div className="App">
      <div className="input">
        <label>Nimi:</label> <br />
        <input ref={nimiRef} type="text" maxLength={15} /> <br />
        <label>Avamine (HH:MM:SS):</label> <br />
        <input ref={avamineRef} type="text" /> <br />
        <label>Sulgemine (HH:MM:SS):</label> <br />
        <input ref={sulgemineRef} type="text" /> <br />
        <button onClick={() => lisaPood()}>Lisa Pood</button>
        <br />
      </div>
      <label>Filtri:</label> <br />
      <input ref={filterRef} type="text" onChange={() => filtreeriPoed()} /> <br />
      <button onClick={naitaAvatudPoed}>Vaadake avatud kauplusi</button>
      {renderAvatudPoed()}
      <br/>
      <button onClick={() => printPDF(poed)}>Print</button>
      <button onClick={openCartModal}>Ostukorv</button>
      <table>
        <thead>
          <tr>
            <th><button onClick={sortPoedByNimi}>Nimi</button></th>
            <th><button onClick={sortPoedByAvamine}>Avamine</button></th>
            <th><button onClick={sortPoedBySulgemine}>Sulgemine</button></th>
            <th><button onClick={sortPoedByKuulastuste}>Kuulastuste</button></th>
            <th>Kustuta</th>
            <th>Lisa Kuulastuste</th>
            <th>Tooted</th>
          </tr>
        </thead>
        <tbody>
          {filtritudPoed.map((pood, index) => (
            <tr key={index}>
              <td>{pood.nimi}</td>
              <td>{pood.avamine}</td>
              <td>{pood.sulgemine}</td>
              <td>{pood.kuulastusteArv}</td>
              <td>
                <button onClick={() => kustutaPood(pood.id)}>Kustuta</button>
              </td>
              <td>
                <button onClick={() => kylasta(pood.nimi)}>+</button>
              </td>
              <td><button onClick={() => {
                setSelectedStore(pood);
                modalwindow();
              }}>Vaata tooted</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
  <div className="modal active">
    <div className="modal-content">
      <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
      <h2>Tooted kaupluses</h2>
      <ul>
        {products.map((product, index) => (
          <ul key={index}>
            {product.title}: {product.price}€ -
            <button onClick={() => addToCart(product)}>Lisa korvi</button>
          </ul>
        ))}
      </ul>
    </div>
  </div>
)}
{isCartModalOpen  && (
        <div className="modal active">
          <div className="modal-content">
            <span className="close" onClick={() => setIsCartModalOpen(false)}>&times;</span>
            <h2>Ostukorv</h2>
            <ul>
              {cart.map((product, index) => (
                <ul key={index}>
                  {product.title}: {product.price}€
                  <button onClick={() => removeFromCart(product)}>Kustuta</button>
                </ul>
              ))}
            </ul>
            <h2>Maksma: {calculateTotalPrice(cart)}€</h2>
            <button onClick={() => setPaymentConfirmation(true)}>Maksa</button>
          </div>
        </div>
      )}
      {PaymentConfirmation && (
  <div className="modal active">
    <div className="modal-content">
      <h2>Maksetõend</h2>
      <p>Kas olete kindel, et soovite maksta?</p>
      <div>
        <button onClick={() => PaymentConfirmations(true)}>Ja</button>
        <button onClick={() => PaymentConfirmations(false)}>Ei</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
export default App;
