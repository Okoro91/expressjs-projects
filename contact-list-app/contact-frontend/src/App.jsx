import { useEffect, useState } from "react";
import { FaUserPlus, FaEdit, FaTrashAlt, FaSave, FaBan } from "react-icons/fa";

const App = () => {
  const [users, setUsers] = useState([]);

  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3001/users");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditingUserChange = (e) => {
    const { name, value } = e.target;
    setEditingUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const addUser = async () => {
    if (
      !newUserData.name.trim() ||
      !newUserData.email.trim() ||
      !newUserData.phone.trim()
    ) {
      alert("Name, Email, and Phone are required to add a user.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error ||
            JSON.stringify(errorData.errors) ||
            "Failed to add user"
        );
      }

      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);

      setNewUserData({
        name: "",
        email: "",
        phone: "",
        location: "",
        dateOfBirth: "",
      });
    } catch (error) {
      console.error("Error adding user:", error.message);
      alert(`Error adding user: ${error.message}`);
    }
  };

  const handleEditing = (user) => {
    setEditingUserId(user._id);

    setEditingUserData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
    });
  };

  const handleSave = async (id) => {
    if (
      !editingUserData.name.trim() ||
      !editingUserData.email.trim() ||
      !editingUserData.phone.trim()
    ) {
      alert("Name, Email, and Phone are required for updating a user.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingUserData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error ||
            JSON.stringify(errorData.errors) ||
            "Failed to update user"
        );
      }

      const updatedUser = await res.json();

      setUsers(users.map((user) => (user._id === id ? updatedUser : user)));
    } catch (err) {
      console.error("Failed to update user:", err.message);
      alert(`Error updating user: ${err.message}`);
    }

    setEditingUserData({
      name: "",
      email: "",
      phone: "",
      location: "",
      dateOfBirth: "",
    });
    setEditingUserId(null);
  };

  const handleCancel = () => {
    setEditingUserData({
      name: "",
      email: "",
      phone: "",
      location: "",
      dateOfBirth: "",
    });
    setEditingUserId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Error deleting user: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
        User Management Dashboard
      </h1>

      <div className="bg-white shadow-xl rounded-lg p-6 mb-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
          <FaUserPlus className="mr-3 text-blue-500" /> Add New User
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <label htmlFor="newName" className="text-gray-700 font-medium mb-1">
              Name:
            </label>
            <input
              id="newName"
              type="text"
              name="name"
              value={newUserData.name}
              onChange={handleNewUserChange}
              placeholder="Full Name"
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="newEmail"
              className="text-gray-700 font-medium mb-1"
            >
              Email:
            </label>
            <input
              id="newEmail"
              type="email"
              name="email"
              value={newUserData.email}
              onChange={handleNewUserChange}
              placeholder="email@example.com"
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="newPhone"
              className="text-gray-700 font-medium mb-1"
            >
              Phone:
            </label>
            <input
              id="newPhone"
              type="tel"
              name="phone"
              value={newUserData.phone}
              onChange={handleNewUserChange}
              placeholder="e.g., +1234567890"
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="newLocation"
              className="text-gray-700 font-medium mb-1"
            >
              Location:
            </label>
            <input
              id="newLocation"
              type="text"
              name="location"
              value={newUserData.location}
              onChange={handleNewUserChange}
              placeholder="City, Country"
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="newDOB" className="text-gray-700 font-medium mb-1">
              Date of Birth:
            </label>
            <input
              id="newDOB"
              type="date"
              name="dateOfBirth"
              value={newUserData.dateOfBirth}
              onChange={handleNewUserChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
            />
          </div>
        </div>
        <button
          onClick={addUser}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center"
        >
          <FaUserPlus className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 border border-purple-100">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">User List</h2>
        {users.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-10">
            No users found. Start by adding one above!
          </p>
        ) : (
          <ul className="space-y-6">
            {users.map((user) => (
              <li
                key={user._id}
                className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
              >
                {editingUserId === user._id ? (
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor={`editName-${user._id}`}
                        className="text-gray-700 text-sm font-medium mb-1"
                      >
                        Name:
                      </label>
                      <input
                        id={`editName-${user._id}`}
                        type="text"
                        name="name"
                        value={editingUserData.name}
                        onChange={handleEditingUserChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`editEmail-${user._id}`}
                        className="text-gray-700 text-sm font-medium mb-1"
                      >
                        Email:
                      </label>
                      <input
                        id={`editEmail-${user._id}`}
                        type="email"
                        name="email"
                        value={editingUserData.email}
                        onChange={handleEditingUserChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`editPhone-${user._id}`}
                        className="text-gray-700 text-sm font-medium mb-1"
                      >
                        Phone:
                      </label>
                      <input
                        id={`editPhone-${user._id}`}
                        type="tel"
                        name="phone"
                        value={editingUserData.phone}
                        onChange={handleEditingUserChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`editLocation-${user._id}`}
                        className="text-gray-700 text-sm font-medium mb-1"
                      >
                        Location:
                      </label>
                      <input
                        id={`editLocation-${user._id}`}
                        type="text"
                        name="location"
                        value={editingUserData.location}
                        onChange={handleEditingUserChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`editDOB-${user._id}`}
                        className="text-gray-700 text-sm font-medium mb-1"
                      >
                        Date of Birth:
                      </label>
                      <input
                        id={`editDOB-${user._id}`}
                        type="date"
                        name="dateOfBirth"
                        value={editingUserData.dateOfBirth}
                        onChange={handleEditingUserChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300"
                      />
                    </div>
                    <div className="md:col-span-full flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleSave(user._id)}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                      >
                        <FaSave className="mr-2" /> Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                      >
                        <FaBan className="mr-2" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-gray-800 text-sm">
                    <p className="font-semibold text-base col-span-full md:col-span-1">
                      {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {user.phone}
                    </p>
                    <p>
                      <strong>Location:</strong> {user.location || "N/A"}
                    </p>
                    <p>
                      <strong>DOB:</strong>{" "}
                      {user.dateOfBirth
                        ? new Date(user.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <div className="md:col-span-full flex justify-end space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleEditing(user)}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center"
                      >
                        <FaEdit className="mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 flex items-center"
                      >
                        <FaTrashAlt className="mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
