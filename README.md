# iTwin Platform - Grouping and Mapping Sample App
This app was bootstrapped using the iTwin Viewer [Create React App](https://github.com/facebook/create-react-app) Template.

## About the Code

This sample application with its collection of widgets is a demonstration of how one would take data prepared on the iTwin Reporting Platform using Grouping and Mapping and consume it in a custom web application. The Environmental Impact Widget takes Reporting data for any given iModel and re-colors elements in the 3D Viewer based on the values of a specified numeric data table column. Warmer colors (red) indicate larger values. And cooler colors (blue, green) indicate smaller values. This can be useful for visualizing all sorts of data gradients in the 3D Viewer such as embodied carbon, lead times, cost, etc. The Procurement Widget creates a summary report of element counts given a set of grouping criteria defined using Grouping and Mapping Properties. Finally the Raw OData Widget is just a raw representation of the data being used to populate the other two workflow-oriented widgets. To tie it together we also have the Grouping & Mapping widget which assists with creating and managing Mappings and Groups against the Reporting Platform APIs.

This sample application takes advantage of the [@itwin/insights-client](https://www.npmjs.com/package/@itwin/insights-client) npm package for easy access to the [Reporting APIs](https://developer.bentley.com/apis/insights/overview/). It also contains client code for consuming the [iModels OData API](https://developer.bentley.com/apis/imodels-odata/).

**Note: the [provided OData client](/src/contexts/imodels-odata-client/README.md) for the iModels OData API is just sample code written for this course and carries no guanrantees for robustness or performance.**

## Bootstrap
If you would like to create your own application from scratch covering workflows similar to those in this sample, you can bootstrap your project with the following commands assuming you have the necessary [dependencies](/CONTRIBUTING.md) installed:

1. `npx create-react-app your-app-name --template @itwin/web-viewer --scripts-version @bentley/react-scripts`
2. `install @itwin/grouping-mapping-widget`
3. `install @itwin/insights-client`
4. `install @itwin/itwinui-icons-react`

## Environment Variables

Prior to running the app, you will need to add OIDC client configuration to the variables in the .env file:

```
# ---- Authorization Client Settings ----
IMJS_AUTH_CLIENT_CLIENT_ID=""
IMJS_AUTH_CLIENT_REDIRECT_URI=""
IMJS_AUTH_CLIENT_LOGOUT_URI=""
IMJS_AUTH_CLIENT_SCOPES =""
```

- You can generate a [test client](https://developer.bentley.com/tutorials/web-application-quick-start/#2-register-an-application) to get started.

- Scopes expected by the viewer are:

  - **Visualization**: `imodelaccess:read`
  - **iModels**: `imodels:read`
  - **Reality Data**: `realitydata:read`
  - **Projects**: `projects:read`
  - **Reporting**: `insights:read insights:modify`

- The application will use the path of the redirect URI to handle the redirection, it must simply match what is defined in your client.

- When you are ready to build a production application, [register here](https://developer.bentley.com/register/).

You should also add a valid iTwinId and iModelId for your user in the this file:

```
# ---- Test ids ----
IMJS_ITWIN_ID = ""
IMJS_IMODEL_ID = ""
```

- For the IMJS_ITWIN_ID variable, you can use the id of one of your existing Projects or Assets. You can obtain their ids via the [Administration REST APIs](https://developer.bentley.com/api-groups/administration/api-reference/).

- For the IMJS_IMODEL_ID variable, use the id of an iModel that belongs to the iTwin that you specified in the IMJS_ITWIN_ID variable. You can obtain iModel ids via the [Data Management REST APIs](https://developer.bentley.com/api-groups/data-management/apis/imodels/operations/get-project-or-asset-imodels/).

- Alternatively, you can [generate a test iModel](https://developer.bentley.com/tutorials/web-application-quick-start/#3-create-an-imodel) to get started without an existing iModel.

- If at any time you wish to change the iModel that you are viewing, you can change the values of the iTwinId or iModelId query parameters in the url (i.e. localhost:3000?iTwinId=myNewITwinId&iModelId=myNewIModelId)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.



## Next Steps

- [iTwin Viewer options](https://www.npmjs.com/package/@itwin/web-viewer-react)

- [Extending the iTwin Viewer](https://www.itwinjs.org/learning/tutorials/hello-world-viewer/)

- [Using the iTwin Platform](https://developer.bentley.com/)

- [iTwin Developer Program](https://www.youtube.com/playlist?list=PL6YCKeNfXXd_dXq4u9vtSFfsP3OTVcL8N)