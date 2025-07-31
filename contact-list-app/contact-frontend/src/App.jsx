import { useEffect, useState } from "react";

const App = () => {
  const [users, setUsers] = useState([]);
  const [addUserInput, setAddUserInput] = useState("");
  const [editingUser, setEditingUser] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3001/users");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const addUser = async (name) => {
    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
    } catch (error) {
      console.log(err);
    }
  };

  const handleAddUser = () => {
    if (addUserInput.trim === "") return;
    addUser(addUserInput);
    setAddUserInput("");
  };

  const handleEditing = (user) => {
    setEditingUserId(user.id);
    setEditingUser(user.name);
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingUser }),
      });
      const updatedUser = await res.json();

      setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
    } catch (err) {
      console.error("Failed to update user", err);
    }

    setEditingUser("");
    setEditingUserId(null);
  };

  const handlecancel = () => {
    setEditingUser("");
    setEditingUserId(null);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <h1>User list data display</h1>
      <input
        type="text"
        value={addUserInput}
        onChange={(e) => setAddUserInput(e.target.value)}
      />{" "}
      <button onClick={handleAddUser}>Add</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {editingUserId === user.id ? (
              <>
                <input
                  type="text"
                  placeholder="Edit name"
                  value={editingUser}
                  onChange={(e) => setEditingUser(e.target.value)}
                />
                <button onClick={() => handleSave(user.id)}>Save</button>
                <button onClick={handlecancel}>cancel</button>
              </>
            ) : (
              <>
                {user.name}
                <button onClick={() => handleEditing(user)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>delete</button>
              </>
            )}{" "}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
