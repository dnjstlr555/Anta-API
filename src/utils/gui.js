const { QLabel, FlexLayout, QWidget, QMainWindow, QPushButton, QMovie, QIcon, QSize, QGridLayout, AlignmentFlag, QDragMoveEvent, WidgetEventTypes, QDropEvent, QDragLeaveEvent, QPixmap, QScrollArea, QInputDialog, QMessageBox, ButtonRole, QApplication, QListWidget, QListWidgetItem, QVariant } = require('@nodegui/nodegui');
const fs = require('fs');
module.exports = (model, serverWrapper) => {
    function mainWindow() {
        // Create a root view and assign a flex layout to it.
        const rootView = new QWidget();
        const layoutMain = new FlexLayout();
        rootView.setLayout(layoutMain);
        rootView.setObjectName("rootView");
        rootView.setInlineStyle("flex: 1; min-height: 400px; min-width:100%;");
        const rootHeader = CreateHeader();
        layoutMain.addWidget(rootHeader);
        const rootMain = CreateMain();
        layoutMain.addWidget(rootMain);

        const win = new QMainWindow();
        win.setCentralWidget(rootView);
        //win.setFixedSize(800, 600);
        win.setWindowTitle("Anta Server Manager");
        win.show();
        global.win = win;

        function CreateHeader() {
            const header = new QWidget();
            const headerLayout = new FlexLayout();
            header.setLayout(headerLayout);
            header.setObjectName("header");
            header.setInlineStyle(`
            flex: 0;
            height: 110;
            min-width: 100%;
            background-color: #f2f2f2;
            justify-content: 'center';
            align-items: 'center';
            flex-direction: row;`);

            const buttonToggleServer = new QPushButton();
            buttonToggleServer.setText("");
            buttonToggleServer.setInlineStyle("width: 110px; height: 110px;");
            const movieServer = new QMovie();
            movieServer.setFileName("src/assets/toggleserver.gif");
            if(serverWrapper.server.listening) {
                movieServer.start();
            }
            movieServer.addEventListener("frameChanged", () => {
                buttonToggleServer.setIcon(new QIcon(movieServer.currentPixmap()));
            });
            buttonToggleServer.setIconSize(new QSize(60, 60));
            buttonToggleServer.addEventListener("clicked", () => {
                if(serverWrapper.server.listening) {
                    movieServer.stop();
                    serverWrapper.close();
                } else {
                    movieServer.start();
                    serverWrapper.listen();
                }
            });
            const labelServer = new QLabel();
            labelServer.setText("Toggle Server");
            labelServer.setAlignment(AlignmentFlag.AlignCenter);
            labelServer.setInlineStyle("margin-top: 70px; width:100px;");
            const buttonToggleServerLayout = new QGridLayout();
            buttonToggleServer.setLayout(buttonToggleServerLayout);
            buttonToggleServerLayout.addWidget(labelServer, 0, 0);

            const buttonConfigs = new QPushButton();
            buttonConfigs.setText("");
            buttonConfigs.setInlineStyle("width: 110px; height: 110px;");
            buttonConfigs.setIcon(new QIcon("src/assets/configs.png"));
            buttonConfigs.setIconSize(new QSize(60, 60));
            const labelConfigs = new QLabel();
            labelConfigs.setText("Configuration");
            labelConfigs.setAlignment(AlignmentFlag.AlignCenter);
            labelConfigs.setInlineStyle("margin-top: 70px; width:100px;");
            const buttonConfigsLayout = new QGridLayout();
            buttonConfigs.setLayout(buttonConfigsLayout);
            buttonConfigsLayout.addWidget(labelConfigs, 0, 0);

            const buttonUserManage = new QPushButton();
            buttonUserManage.setText("");
            buttonUserManage.setInlineStyle("width: 110px; height: 110px;");
            buttonUserManage.setIcon(new QIcon("src/assets/users.png"));
            buttonUserManage.setIconSize(new QSize(60, 60));
            const labelUserManage = new QLabel();
            labelUserManage.setText("Users");
            labelUserManage.setAlignment(AlignmentFlag.AlignCenter);
            labelUserManage.setInlineStyle("margin-top: 70px; width:100px;");
            const buttonUserManageLayout = new QGridLayout();
            buttonUserManage.setLayout(buttonUserManageLayout);
            buttonUserManageLayout.addWidget(labelUserManage, 0, 0);


            const buttonPlugins = new QPushButton();
            buttonPlugins.setText("");
            buttonPlugins.setInlineStyle("width: 110px; height: 110px;");
            buttonPlugins.setIcon(new QIcon("src/assets/plugins.png"));
            buttonPlugins.setIconSize(new QSize(60, 60));
            const labelPlugins = new QLabel();
            labelPlugins.setText("Plugins");
            labelPlugins.setAlignment(AlignmentFlag.AlignCenter);
            labelPlugins.setInlineStyle("margin-top: 70px; width:100px;");
            const buttonPluginsLayout = new QGridLayout();
            buttonPlugins.setLayout(buttonPluginsLayout);
            buttonPluginsLayout.addWidget(labelPlugins, 0, 0);


            headerLayout.addWidget(buttonToggleServer);
            headerLayout.addWidget(buttonConfigs);
            headerLayout.addWidget(buttonUserManage);
            headerLayout.addWidget(buttonPlugins);

            return header;
        }

        function CreateMain() {
            const scrollArea = new QScrollArea();
            scrollArea.setInlineStyle("flex: 1;");
            scrollArea.setWidgetResizable(true);
            const widget = new QListWidget();
            scrollArea.setWidget(widget);
            widget.addEventListener("itemDoubleClicked", (e) => {
                const data=e.data(0x0100).toString();
                if(!data) return;
                const confirm = new QMessageBox();
                confirm.setWindowTitle("Remove Shared Folder");
                confirm.setText(data+" - Are you sure you want to remove this shared folder?");
                const yes = new QPushButton();
                yes.setText('Yes');
                yes.addEventListener("clicked", () => {
                    model.RemoveSharedFolder(data);
                    UpdateEntries();
                });
                const no = new QPushButton();
                no.setText('No');
                confirm.addButton(yes, ButtonRole.YesRole);
                confirm.addButton(no, ButtonRole.NoRole);
                confirm.exec();
            });
            UpdateEntries();

            rootView.setAcceptDrops(true);
            rootView.addEventListener(WidgetEventTypes.DragEnter, (e) => {
                const ev = new QDragMoveEvent(e);
                ev.accept(); //Accept the drop event, which is crucial for accepting further events
            });
            rootView.addEventListener(WidgetEventTypes.Drop, (e) => {
                const ev = new QDragMoveEvent(e);
                const mimeData = ev.mimeData();
                const urls = mimeData.urls(); //Get QUrls
                for (let url of urls) {
                    if (!url.isLocalFile()) return;
                    const str = url.toString().replace('file:///', '');
                    if(!fs.statSync(str).isDirectory()) {
                        const msg = new QMessageBox();
                        msg.setWindowTitle("Error");
                        msg.setText("You can only share folders");
                        const ok = new QPushButton();
                        ok.setText('Ok');
                        msg.addButton(ok, ButtonRole.AcceptRole);
                        msg.exec();
                        return;
                    }
                    const inputDialog = new QInputDialog();
                    inputDialog.setWindowTitle("Share Folder");
                    inputDialog.setLabelText(`${str}\nEnter the name of the shared folder`);
                    inputDialog.exec();
                    const name = inputDialog.textValue();
                    model.AddSharedFolder(name, str);
                }
                UpdateEntries();
            });
            rootView.addEventListener(WidgetEventTypes.DragLeave, (e) => {
                console.log('dragLeave', e);
                let ev = new QDragLeaveEvent(e);
                ev.ignore(); //Ignore the event when it leaves
                console.log('ignored', ev);
            });
            
            return scrollArea;

            function UpdateEntries() {
                widget.clear();
                if(Object.keys(model.sharedList).length === 0) {
                    const item = new QListWidgetItem();
                    item.setText("No shared folders found, drag and drop folders here to share them");
                    item.setData(0x0100, new QVariant(false));
                    widget.addItem(item);
                    widget.update();
                    scrollArea.update();
                    return;
                }
                for (const [k, v] of Object.entries(model.sharedList)) {
                    const item = new QListWidgetItem();
                    item.setText(k + " - " + v);
                    item.setData(0x0100, new QVariant(k));
                    widget.addItem(item);
                }
                widget.update();
                scrollArea.update();
            }
        }
    }
    return {
        mainWindow
    };
}