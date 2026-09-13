import HeaderClient from "./components/HeaderClient";
import { getServerSession } from "next-auth"
import Sidebar from "./components/Sidebar";
import { ViewProvider } from "./components/ViewContext";
import { FeedbackProvider } from "./components/FeedbackContext";
import { ThemeProvider } from "./components/ThemeContext";
import { DeveloperModeProvider } from "./components/DeveloperModeContext";
import Footer from "../../components/Footer";


export default function MainLayout({ children }) {
	return (
		<ThemeProvider>
			<DeveloperModeProvider>
				<ViewProvider>
					<FeedbackProvider>
						<div className="flex h-screen bg-background text-foreground overflow-hidden">
							<Sidebar />
							<div className="flex flex-col flex-1 overflow-hidden">
								<HeaderClient>
									<div id="main-scroll-container" className="overflow-y-auto h-full">
										{children}
										<Footer />
									</div>
								</HeaderClient>
							</div>
						</div>
					</FeedbackProvider>
				</ViewProvider>
			</DeveloperModeProvider>
		</ThemeProvider>
	);
}