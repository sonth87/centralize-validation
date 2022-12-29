# centralize-validation


# Cách sử dụng
// Quy tắc validate
var validateRule = {
  // Tên trường
  name: {
    label: "Họ và tên", // Không bắt buộc
    type: "string", // Không bắt buộc
    // Gồm các kiểu "string" | "number" | "phone" | "email" | "url" | "date" | "password"
    // Mặc định là "string"
    rule: {
      require: { // Không bắt buộc
        value: true, // true | false
        // Mặc định là false
        message: "Không được để trống" // Không bắt buộc, thay thế cho message mặc định
      },
    }
  },
  amount: {
    type: "number",
    rule: {
      min: {
        value: 100
      },
      max: {
        value: 200
      }
    }
  },
}

// Form value
var value = { name: "Nguyen Van A", amount: 20 };

// Gọi hàm validate
var validateForm = validate(value, config);

# Các kiểu dữ liệu:
email: validate theo email +
  default regex: REGEX.email +
  default message: "%{label} không đúng định dạng" // label của trường

phone: validate theo số điện thoại(theo nhà mạng) +
  default regex: REGEX.phone +
  default message: "%{label} không đúng định dạng" // label của trường

date: validate ngày tháng năm +
  default regex: REGEX.date // format : dd-MM-YYYY | dd.MM.YYYY | dd/MM/YYYY
  +
  default message: "%{label} không đúng định dạng" // label của trường

url: validate theo url +
  default regex: REGEX.url // format : (http(s)://)(www.)myvbi.vn/
  +
  default message: "%{label} không đúng định dạng" // label của trường

age: validate theo tuổi.Giá trị truyền yêu cầu:
  +min: số tuổi nhỏ nhất cho phép +
  max: số tuổi lớn nhất cho phép {
    value: 16, // Giá trị tuổi
    type: "d", // Tính theo đơn vị:  d: ngày / m: tháng / y: năm	 -default: y
    toDate: "", // Mốc ngày để tính tuổi (vd: ngày hiệu lực, ngày hiện tại) -default: ngày hiện tại
    message: "Người được bảo hiểm phải trên 16 ngày tuổi" // Thông báo lỗi -default: lấy theo message min, max của number
  },

  string: validate theo chuỗi

number: validate theo số 


# Các rule:
require: Bắt buộc nhập hay không +
  default message: "Không được để trống"

min: quy định giá trị nhỏ nhất với number, hay ngắn nhất với string +
  default message(string): "%{label} phải nhiều hơn %{num} ký tự"
  // label của trường, num là giá trị truyền vào (min)
  +
  default message(number): "%{label} phải lớn hơn %{num}"
// label của trường, num là giá trị truyền vào (min)

max: quy định giá trị lớn nhất với number, hay dài nhất với string +
  default message(string): "%{label} phải ít hơn %{num} ký tự"
  // label của trường, num là giá trị truyền vào (max)
  +
  default message(number): "%{label} phải nhỏ hơn %{num}"
// label của trường, num là giá trị truyền vào (max)

length: độ dài cố định với cả string và number,

  format: custom validate theo regex, truyền vào value là 1 regex +
  default message: "%{label} không đúng định dạng"
// label của trường


# Các hàm gọi riêng
`- Lấy regex`
REGEX.email // regex cho email
REGEX.phone // regex cho phone ( theo nhà mạng )
REGEX.url // regex cho url
REGEX.date // regex cho date ( format: dd-MM-YYYY | dd.MM.YYYY | dd/MM/YYYY )
REGEX.password // regex cho password ( phải có chữ thường, chữ hoa, số và ký tự đặc biệt )
REGEX.cccd_hc // regex cho số CMT, CCCD, Hộ chiếu


`- Tính số tuổi`
validate.getAgeByDob(inputDate, compareDate, type);

+
inputDate: ngày tháng năm sinh +
  compareDate: ngày hiệu lưc, ngày hiện tại, ...mặc định là ngày hiện tại +
  type: "d" | "m" | "y"
lấy số tuổi theo ngày | tháng | năm.Mặc định: "y"

vd: Tính số ngày tuổi của người có ngày sinh 20 / 12 / 2022 so với thời điểm 29 / 12 / 2022
validate.getAgeByDob("20/12/2022", "29/12/2022", "d");
// Kết quả: 9

Tính số năm tuổi của người có ngày sinh 28 / 09 / 1987 so với ngày hiện tại
validate.getAgeByDob("28/09/1987");
// Kết quả: 35
