import { useEffect, useState } from "react";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

import "./index.css";

import { Hourglass } from "react-loader-spinner";

const Home = () => {
  const [edit, setEdit] = useState(false);
  const [dbData, setDBData] = useState([]);
  const [piechartData, setPieData] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Bill",
    date: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    // Function to fetch data asynchronously
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://plattr-backend-5lcp.onrender.com/getdata"
        );

        const data = await response.json();
        const temp = data.data;
        setDBData(data.data);
        function groupByCategoryAndCalculateTotal(data) {
          const groupedData = data.reduce((acc, item) => {
            const category = item.category;
            const amount = parseInt(item.amount);

            if (!acc[category]) {
              acc[category] = {
                total: amount,
                color: getRandomColor(),
              };
            } else {
              acc[category].total += amount;
            }

            return acc;
          }, {});

          return Object.keys(groupedData).map((category) => ({
            category,
            total: groupedData[category].total,
            color: groupedData[category].color,
          }));
        }

        function getRandomColor() {
          const letters = "0123456789ABCDEF";
          let color = "#";
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }
        const result = groupByCategoryAndCalculateTotal(temp);
        console.log(result);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        /* const piechartData = [
          {
            title: "Bill",
            color: "blue",
            value: dbData
              .filter((item) => item.category === "Bill")
              .reduce((sum, item) => sum + (item?.amount || 0), 0),
          },
          {
            title: "Health Care",
            color: "cyan",
            value: dbData
              .filter((item) => item.category === "Health Care")
              .reduce((sum, item) => sum + (item?.amount || 0), 0),
          },
          {
            title: "Insurance",
            color: "purple",
            value: dbData
              .filter((item) => item.category === "Insurance")
              .reduce((sum, item) => sum + (item?.amount || 0), 0),
          },
          {
            title: "Shopping",
            color: "lightgreen",
            value: dbData
              .filter((item) => item.category === "Shopping")
              .reduce((sum, item) => sum + (item?.amount || 0), 0),
          },
          {
            title: "Food",
            color: "grey",
            value: dbData
              .filter((item) => item.category === "Food")
              .reduce((sum, item) => sum + (item?.amount || 0), 0),
          },
          {
            title: "Entertainment",
            color: "orange",
            value: dbData
              .filter((item) => item.category === "Entertainment")
              .reduce((sum, item) => sum + (item?.amount || 0), 0),
          },
        ]; */
        setPieData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    //console.log(piechartData);

    fetchData();
  }, []);

  const submitChanges = async (e) => {
    e.preventDefault();
    const response = await fetch(
      "https://plattr-backend-5lcp.onrender.com/addexpense",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Sending the form data as JSON
      }
    );
    console.log(response);
    setFormData({ title: "", amount: 0, category: "", date: "" });
    if (response.ok) {
      window.location.reload();
    }
  };

  const onEditExpense = async (e) => {
    const title = e.target.value;
    setEdit(true);
    const newDtata = [...dbData];
    const data = newDtata.filter((exp) => exp.id === title);
    console.log(data);
    setFormData({
      title: data[0].title,
      amount: data[0].amount,
      category: data[0].category,
      date: data[0].date,
    });
    console.log(formData);
  };
  const onChangeExpense = async () => {
    setEdit(false);
    const response = await fetch(
      "https://plattr-backend-5lcp.onrender.com/update",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData }), // Sending the form data as JSON
      }
    );
    if (response.ok) {
      window.location.reload();
    }
  };

  const onDeleteExpense = async (e) => {
    const title = e.target.value;
    const response = await fetch(
      "https://plattr-backend-5lcp.onrender.com/delete",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }), // Sending the form data as JSON
      }
    );
    if (response.ok) {
      window.location.reload();
    }
  };
  const renderDBDATA = () => {
    return (
      <>
        {dbData.map((expense) => (
          <div className="data-container" key={expense._id}>
            <p className="data">{expense.title}</p>
            <p className="data">{expense.amount}</p>
            <p className="data">{expense.category}</p>
            <p className="data">{expense.date}</p>
            <div className="data button-container">
              <button
                className="edit-button"
                onClick={onEditExpense}
                value={expense.id}
              >
                Edit
              </button>
              <button
                value={expense.title}
                onClick={onDeleteExpense}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </>
    );
  };
  console.log(piechartData);
  return (
    <div className="container">
      <h1 className="heading">Expense Tracker</h1>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={piechartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          />
        </PieChart>
      </ResponsiveContainer>
      <form onSubmit={submitChanges} className="add-expense-container">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Expense Title"
          required
        />
        <input
          type="number"
          value={formData.amount}
          name="amount"
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <select
          name="category"
          onChange={handleChange}
          value={formData.category}
        >
          <option>Bill</option>
          <option>Health Care</option>
          <option>Food</option>
          <option>Insurance</option>
          <option>Shopping</option>
          <option>Entertainment</option>
        </select>
        <input
          type="date"
          name="date"
          onChange={handleChange}
          value={formData.date}
        />
        {edit ? (
          <button onClick={onChangeExpense} className="add-button" type="save">
            Save
          </button>
        ) : (
          <button className="add-button" type="submit">
            Add Expense
          </button>
        )}
      </form>
      <div className="table">
        <div className="title-container">
          <h1 className="title">Expense Name</h1>
          <h1 className="title">Amount</h1>
          <h1 className="title">Category</h1>
          <h1 className="title">Date</h1>
          <h1 className="title">Action</h1>
        </div>
        {dbData.length === 0 ? (
          <p>No Expense To Show</p>
        ) : dbData ? (
          renderDBDATA()
        ) : (
          <Hourglass
            visible={true}
            height="80"
            width="80"
            ariaLabel="hourglass-loading"
            wrapperStyle={{}}
            wrapperClass=""
            colors={["#306cce", "#72a1ed"]}
          />
        )}
      </div>
    </div>
  );
};
export default Home;
