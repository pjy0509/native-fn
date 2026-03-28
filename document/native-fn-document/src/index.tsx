import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyle from "./styled/GlobalStyle";
import AppThemeProvider from "./providers/AppThemeProvider";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <AppThemeProvider>
            <GlobalStyle/>

            <App/>
        </AppThemeProvider>
    </React.StrictMode>
);

reportWebVitals();
