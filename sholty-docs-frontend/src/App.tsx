import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Documents from "./pages/Documents";
import DocumentForm from "./pages/DocumentForm";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
	return (
		<Routes>
      		<Route path="/login" element={<Login />} />
      		<Route path="/register" element={<Register />} />
			<Route path="/documents" 
				element={
					<ProtectedRoute>
						<Documents />
					</ProtectedRoute>
				} 
			/>
			<Route path="/documents/new" 
				element={
					<ProtectedRoute>
						<DocumentForm />
					</ProtectedRoute>
				} 
			/>


			<Route path="/documents/:id/edit" 
				element={
					<ProtectedRoute>
						<DocumentForm />
					</ProtectedRoute>
				} 
			/>

			<Route path="*" element={<Navigate to="/documents" replace />} />
    	</Routes>
	);
}

export default App;
