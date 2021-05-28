const toastrDefaults = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: "toast-top-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300", // 300
  hideDuration: "1000", // 1000
  timeOut: "10000", // 10000
  extendedTimeOut: "1000", // 1000
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

function showToast(title, message, type) {
  toastr.options = toastrDefaults;

  toastr[type](message, title);
}
