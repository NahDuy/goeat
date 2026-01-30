// Dữ liệu món ăn - Bạn có thể chỉnh sửa trực tiếp tại đây
// Mỗi mục gồm: suit (chất), value (số), dish (tên món)
window.FOOD_DATA = [
    // A (Ace)
    { suit: 'hearts', value: 'A', display: 'A', dish: 'Phở', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: 'A', display: 'A', dish: 'Cơm tấm', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: 'A', display: 'A', dish: 'Bánh mì', color: 'black', symbol: '♣' },
    { suit: 'spades', value: 'A', display: 'A', dish: 'Bún đậu mắm tôm', color: 'black', symbol: '♠' },

    // 2
    { suit: 'hearts', value: '2', display: '2', dish: 'Bún bò Huế', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '2', display: '2', dish: 'Cơm gà', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '2', display: '2', dish: 'Bánh xèo', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '2', display: '2', dish: 'Bún chả', color: 'black', symbol: '♠' },

    // 3
    { suit: 'hearts', value: '3', display: '3', dish: 'Bún riêu', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '3', display: '3', dish: 'Cơm sườn', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '3', display: '3', dish: 'Bánh cuốn', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '3', display: '3', dish: 'Nem nướng', color: 'black', symbol: '♠' },

    // 4
    { suit: 'hearts', value: '4', display: '4', dish: 'Hủ tiếu', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '4', display: '4', dish: 'Cơm chiên', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '4', display: '4', dish: 'Bánh khọt', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '4', display: '4', dish: 'Gỏi cuốn', color: 'black', symbol: '♠' },

    // 5
    { suit: 'hearts', value: '5', display: '5', dish: 'Miến gà', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '5', display: '5', dish: 'Cơm bò lúc lắc', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '5', display: '5', dish: 'Bánh căn', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '5', display: '5', dish: 'Chả giò', color: 'black', symbol: '♠' },

    // 6
    { suit: 'hearts', value: '6', display: '6', dish: 'Cháo sườn', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '6', display: '6', dish: 'Cơm niêu', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '6', display: '6', dish: 'Bánh ướt', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '6', display: '6', dish: 'Ốc các loại', color: 'black', symbol: '♠' },

    // 7
    { suit: 'hearts', value: '7', display: '7', dish: 'Bánh canh', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '7', display: '7', dish: 'Cơm cá kho', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '7', display: '7', dish: 'Bánh bèo', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '7', display: '7', dish: 'Lẩu Thái', color: 'black', symbol: '♠' },

    // 8
    { suit: 'hearts', value: '8', display: '8', dish: 'Bún mọc', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '8', display: '8', dish: 'Cơm gà xối mỡ', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '8', display: '8', dish: 'Bánh đúc', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '8', display: '8', dish: 'Lẩu bò', color: 'black', symbol: '♠' },

    // 9
    { suit: 'hearts', value: '9', display: '9', dish: 'Bún thang', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '9', display: '9', dish: 'Cơm trộn', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '9', display: '9', dish: 'Bánh hỏi', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '9', display: '9', dish: 'Lẩu hải sản', color: 'black', symbol: '♠' },

    // 10
    { suit: 'hearts', value: '10', display: '10', dish: 'Mì Quảng', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: '10', display: '10', dish: 'Cơm chay', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: '10', display: '10', dish: 'Bánh tráng nướng', color: 'black', symbol: '♣' },
    { suit: 'spades', value: '10', display: '10', dish: 'BBQ nướng', color: 'black', symbol: '♠' },

    // J
    { suit: 'hearts', value: 'J', display: 'J', dish: 'Bún cá', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: 'J', display: 'J', dish: 'Cơm cà ri', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: 'J', display: 'J', dish: 'Bánh tráng trộn', color: 'black', symbol: '♣' },
    { suit: 'spades', value: 'J', display: 'J', dish: 'Gà nướng', color: 'black', symbol: '♠' },

    // Q
    { suit: 'hearts', value: 'Q', display: 'Q', dish: 'Bún chả cá', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: 'Q', display: 'Q', dish: 'Cơm vịt', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: 'Q', display: 'Q', dish: 'Bánh bột lọc', color: 'black', symbol: '♣' },
    { suit: 'spades', value: 'Q', display: 'Q', dish: 'Vịt quay', color: 'black', symbol: '♠' },

    // K
    { suit: 'hearts', value: 'K', display: 'K', dish: 'Bún mắm', color: 'red', symbol: '♥' },
    { suit: 'diamonds', value: 'K', display: 'K', dish: 'Cơm thịt kho', color: 'red', symbol: '♦' },
    { suit: 'clubs', value: 'K', display: 'K', dish: 'Bánh bao', color: 'black', symbol: '♣' },
    { suit: 'spades', value: 'K', display: 'K', dish: 'Hải sản', color: 'black', symbol: '♠' }
];
