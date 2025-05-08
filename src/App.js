import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import Axios from "./Axios";

// Mock data - in a real app these would come from an API
const initialDoctors = [
  {
    id: 1,
    specialty: "Cardiology",
    username: "sjohnson",
    password: "doctor123",
  },
  {
    id: 2,
    specialty: "Neurology",
    username: "mchen",
    password: "doctor123",
  },
  {
    id: 3,
    specialty: "Pediatrics",
    username: "lbrown",
    password: "doctor123",
  },
];

const initialPatients = [
  {
    id: 1,
    age: 45,
    username: "jsmith",
    password: "patient123",
  },
  {
    id: 2,
    age: 32,
    username: "mgarcia",
    password: "patient123",
  },
  {
    id: 3,
    age: 58,
    username: "rlee",
    password: "patient123",
  },
];

const initialAppointments = [
  {
    id: 1,
    doctorId: 1,
    patientId: 2,
    date: "2025-05-10",
    description: "09:00",
    status: "confirmed",
  },
  {
    id: 2,
    doctorId: 3,
    patientId: 1,
    date: "2025-05-12",
    description: "14:30",
    status: "confirmed",
  },
  {
    id: 3,
    doctorId: 2,
    patientId: 3,
    date: "2025-05-15",
    description: "11:15",
    status: "confirmed",
  },
];

// Main App Component
export default function App() {
  // State variables
  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [registerType, setRegisterType] = useState("patient");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    specialty: "",
    age: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: "",
    date: "",
    description: "",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  // Effect to reset form when registration type changes
  useEffect(() => {
    setRegisterForm({
      username: "",
      password: "",
      specialty: "",
      age: "",
    });
    getMyData();
    getDoctors();
    getPatients();
    getAppointments();
  }, [registerType, userType]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    const { username, password } = loginForm;

    const { data } = await Axios.post("/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", data?.token);

    if (data?.token) {
      setUser(data?.user);
      setUserType(data?.user?.role);
      setActiveTab("dashboard");
      setLoginForm({ username: "", password: "" });
      setModalContent("Login successful!");
      setShowModal(true);
    } else {
      setModalContent("Invalid username or password!");
      setShowModal(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUserType(null);
    setActiveTab("login");
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if username already exists
    const usernameExists = [...doctors, ...patients].some(
      (u) => u.username === registerForm.username
    );

    if (usernameExists) {
      setModalContent("Username already exists!");
      setShowModal(true);
      return;
    }

    const { data } = await Axios.post("/auth/register", {
      username: registerForm.username,
      password: registerForm.password,
      specialty: registerType === "doctor" ? registerForm.specialty : null,
      age: registerType === "patient" ? registerForm.age : null,
      role: registerType,
    });
    console.log("data", data);

    setRegisterForm({
      username: "",
      password: "",
      specialty: "",
      age: "",
    });
    setModalContent(
      `Registration successful! You can now login as a ${registerType}.`
    );
    setShowModal(true);
    setActiveTab("login");
  };

  // Handle appointment booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (
      !appointmentForm.doctorId ||
      !appointmentForm.date ||
      !appointmentForm.description
    ) {
      setModalContent("Please fill all fields!");
      setShowModal(true);
      return;
    }

    // Check for conflicting appointments
    // const conflictingAppointment = appointments.find(
    //   (a) =>
    //     a.doctorId === parseInt(appointmentForm.doctorId) &&
    //     a.date === appointmentForm.date &&
    //     a.description === appointmentForm.description
    // );

    // if (conflictingAppointment) {
    //   setModalContent("This description slot is already booked!");
    //   setShowModal(true);
    //   return;
    // }
    const token = localStorage.getItem("token");
    const { data } = await Axios.post(
      "/appointments",
      {
        doctorId: appointmentForm.doctorId,
        patientId: user.id,
        date: appointmentForm.date,
        description: appointmentForm.description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    getAppointments();
    setAppointmentForm({ doctorId: "", date: "", description: "" });
    setModalContent("Appointment booked successfully!");
    setShowModal(true);
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    await Axios.delete(`/appointments/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    getAppointments();

    setModalContent("Appointment cancelled successfully!");
    setShowModal(true);
  };

  // Helper function to get doctor name by ID
  const getDoctorName = (id) => {
    const doctor = doctors.find((d) => d.id === id);
    return doctor ? doctor.username : "Unknown Doctor";
  };

  // Helper function to get patient name by ID
  const getPatientName = (id) => {
    const patient = patients.find((p) => p.id === id);
    return patient ? patient.username : "Unknown Patient";
  };

  const getDoctors = async () => {
    try {
      const { data } = await Axios.get("/users/doctors");
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };
  const getPatients = async () => {
    try {
      const { data } = await Axios.get("/users/patients");
      setPatients(data);
    } catch (error) {
      console.error("Error fetching Patient:", error);
    }
  };
  const getMyData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setUserType(null);
        return;
      }
      const { data } = await Axios.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data.user);
      setUserType(data.user.role);
    } catch (error) {
      console.error("Error fetching My Data:", error);
    }
  };
  const getAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setUserType(null);
        return;
      }
      const { data } = await Axios.get("/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  console.log(appointments);
  

  // Filter appointments based on user type
  const filteredAppointments =
    userType === "doctor"
      ? appointments.filter((a) => a.doctorId === user.id)
      : userType === "patient"
      ? appointments.filter((a) => a.patientId === user.id)
      : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">HealthCare Appointment System</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span>Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {/* Navigation Tabs */}
        {user && (
          <nav className="mb-6">
            <ul className="flex gap-1 border-b border-gray-200">
              <li>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "dashboard"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </button>
              </li>
              {userType === "patient" && (
                <li>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "book-appointment"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("book-appointment")}
                  >
                    Book Appointment
                  </button>
                </li>
              )}
              <li>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "my-appointments"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("my-appointments")}
                >
                  My Appointments
                </button>
              </li>
              <li>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "directory"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("directory")}
                >
                  Directory
                </button>
              </li>
            </ul>
          </nav>
        )}

        {/* Content Area */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Login Form */}
          {!user && activeTab === "login" && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-blue-600 hover:underline"
                  >
                    Need an account? Register
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Register Form */}
          {!user && activeTab === "register" && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">
                Register as a {registerType}
              </h2>
              <div className="flex gap-4 mb-4">
                <button
                  className={`flex-1 py-2 rounded ${
                    registerType === "patient"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setRegisterType("patient")}
                >
                  Patient
                </button>
                <button
                  className={`flex-1 py-2 rounded ${
                    registerType === "doctor"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setRegisterType("doctor")}
                >
                  Doctor
                </button>
              </div>
              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        username: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                {registerType === "doctor" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Specialty
                    </label>
                    <input
                      type="text"
                      value={registerForm.specialty}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          specialty: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                )}
                {registerType === "patient" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={registerForm.age}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          age: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-blue-600 hover:underline"
                  >
                    Already have an account? Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Dashboard */}
          {user && activeTab === "dashboard" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium mb-2">
                    Upcoming Appointments
                  </h3>
                  <div className="text-3xl font-bold">
                    {appointments.length}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-lg font-medium mb-2">
                    {userType === "doctor"
                      ? "Total Patients"
                      : "Available Doctors"}
                  </h3>
                  <div className="text-3xl font-bold">
                    {userType === "doctor" ? patients.length : doctors.length}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    {userType === "patient" && (
                      <button
                        onClick={() => setActiveTab("book-appointment")}
                        className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
                      >
                        <Calendar size={16} />
                        Book New Appointment
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab("my-appointments")}
                      className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition"
                    >
                      <Clock size={16} />
                      View My Appointments
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">
                  Recent Appointments
                </h3>
                {appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 border">Date</th>
                          <th className="text-left p-3 border">Description</th>
                          {userType === "doctor" ? (
                            <th className="text-left p-3 border">Patient</th>
                          ) : (
                            <th className="text-left p-3 border">Doctor</th>
                          )}
                          <th className="text-left p-3 border">Specialty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 3).map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50">
                            <td className="p-3 border">
                              {appointment.date.slice(0, 10)}
                            </td>

                            <td className="p-3 border">
                              {appointment.description}
                            </td>
                            {userType === "doctor" ? (
                              <td className="p-3 border">
                                {appointment.patientId.username}
                              </td>
                            ) : (
                              <td className="p-3 border">
                                {appointment.doctorId.username}
                              </td>
                            )}
                            <td className="p-3 border">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                {appointment.doctorId.specialty}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No appointments found.</p>
                )}
              </div>
            </div>
          )}

          {/* Book Appointment */}
          {user &&
            userType === "patient" &&
            activeTab === "book-appointment" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Book a New Appointment
                </h2>
                <form onSubmit={handleBookAppointment} className="max-w-lg">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Select Doctor
                    </label>
                    <select
                      value={appointmentForm.doctorId}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          doctorId: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">-- Select Doctor --</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.username} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={appointmentForm.date}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={appointmentForm.description}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Book Appointment
                  </button>
                </form>

                {appointmentForm.doctorId && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">
                      Doctor's Schedule
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Existing appointments for{" "}
                      {getDoctorName(parseInt(appointmentForm.doctorId))}:
                    </p>
                    {appointments.filter(
                      (a) => a.doctorId === parseInt(appointmentForm.doctorId)
                    ).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="text-left p-3 border">Date</th>
                              <th className="text-left p-3 border">
                                Description
                              </th>
                              <th className="text-left p-3 border">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments
                              .filter(
                                (a) =>
                                  a.doctorId ===
                                  parseInt(appointmentForm.doctorId)
                              )
                              .map((appointment) => (
                                <tr
                                  key={appointment.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="p-3 border">
                                    {appointment.date}
                                  </td>
                                  <td className="p-3 border">
                                    {appointment.description}
                                  </td>
                                  <td className="p-3 border">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                      {appointment.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No existing appointments for this doctor.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* My Appointments */}
          {user && activeTab === "my-appointments" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
              {appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border">Date</th>
                        <th className="text-left p-3 border">description</th>
                        {userType === "doctor" ? (
                          <th className="text-left p-3 border">Patient</th>
                        ) : (
                          <th className="text-left p-3 border">Doctor</th>
                        )}
                        <th className="text-left p-3 border">Description</th>
                        <th className="text-left p-3 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="p-3 border">
                            {appointment.date.slice(0, 10)}
                          </td>
                          <td className="p-3 border">
                            {appointment.description}
                          </td>
                          {userType === "doctor" ? (
                            <td className="p-3 border">
                              {appointment.patientId.username}
                            </td>
                          ) : (
                            <td className="p-3 border">
                              {appointment.doctorId.username}
                            </td>
                          )}
                          <td className="p-3 border">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                              {appointment.doctorId.specialty}
                            </span>
                          </td>
                          <td className="p-3 border">
                            <button
                              onClick={() =>
                                handleCancelAppointment(appointment._id)
                              }
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <Trash2 size={16} />
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No appointments found.</p>
              )}
            </div>
          )}

          {/* Directory */}
          {user && activeTab === "directory" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Directory</h2>
              <div className="flex mb-4">
                <button
                  className={`flex-1 py-2 ${
                    registerType === "doctor"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setRegisterType("doctor")}
                >
                  Doctors
                </button>
                <button
                  className={`flex-1 py-2 ${
                    registerType === "patient"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setRegisterType("patient")}
                >
                  Patients
                </button>
              </div>

              {registerType === "doctor" && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border">Name</th>
                        <th className="text-left p-3 border">Specialty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="p-3 border">{doctor.username}</td>
                          <td className="p-3 border">{doctor.specialty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {registerType === "patient" && userType === "doctor" && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border">Name</th>
                        <th className="text-left p-3 border">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="p-3 border">{patient.username}</td>
                          <td className="p-3 border">{patient.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {registerType === "patient" && userType === "patient" && (
                <p className="text-gray-500">
                  Patient information is only visible to doctors.
                </p>
              )}
            </div>
          )}

          {/* Welcome screen for non-logged in users */}
          {!user && activeTab !== "login" && activeTab !== "register" && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">
                Welcome to Healthcare Appointment System
              </h2>
              <p className="text-gray-600 mb-8">
                Please login or register to continue
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setActiveTab("login")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} Healthcare Appointment System. All
            rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notification</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-4">{modalContent}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
