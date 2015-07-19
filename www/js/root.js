/**
 * Created by leo on 15/7/19.
 */
document.addEventListener("deviceready", function () {
    var device = $cordovaDevice.getDevice();
    var cordova = $cordovaDevice.getCordova();
    var model = $cordovaDevice.getModel();
    var platform = $cordovaDevice.getPlatform();
    var uuid = $cordovaDevice.getUUID();
    var version = $cordovaDevice.getVersion();

    if (platform == 'Android') {
        window.umappkey = '5598edc167e58e4247001e1e';
    } else {
        window.umappkey = '5598ee6867e58e42e9002113';
    }
    alert(platform);
});