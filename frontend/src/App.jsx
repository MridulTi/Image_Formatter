import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home/Home";
import MainLayout from "./Pages/More/MainLayout";

function App() {
  const router = createBrowserRouter([
    {
      path:"/",
      element:<MainLayout/>,
      children:[
        {
          path: "/",
          element: <Home/>,
        },
      ]
    }
      
    // {
    //   path: "/events",
    //   children: [
    //     {
    //       path: '/Case_Study',
    //       element: <CaseStudies/>,
    //     },
    //     {
    //       path: '/Case_Dtudy/:Case_Slug',
    //       element: <SingleCase/>,
    //     }
    //   ]
    // },
  ]);
  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
