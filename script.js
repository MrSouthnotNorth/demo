document.addEventListener('DOMContentLoaded', function() {
    // --- DỮ LIỆU MẪU ---
    const sampleNames = ["Anh Tuấn", "Chị Lan", "Minh Anh", "Hoàng Long", "Thanh Mai", "Quốc Bảo", "Ngọc Diệp", "Đức Huy", "Phương Thảo", "Gia Hân"];
    const sampleComments = [
        "Ngon tuyệt vời, nước dùng đậm đà khó cưỡng!",
        "Hương vị chuẩn Hà Nội, rất đáng thử.",
        "Thịt bò tươi, bánh phở mềm. Sẽ quay lại!",
        "Chả nướng rất thơm, nước chấm vừa miệng.",
        "Ăn một lần là nhớ mãi hương vị Hà Nội.",
        "Quán sạch sẽ, phục vụ nhanh nhẹn.",
        "Giá cả hợp lý so với chất lượng.",
        "Một trong những quán ngon nhất mình từng ăn.",
        "Không gian ấm cúng, phù hợp đi với gia đình.",
        "Sẽ giới thiệu cho bạn bè và người thân.",
        "Món ăn được trình bày đẹp mắt."
    ];

    // Danh sách avatar mẫu (người, thiên nhiên, v.v.)
    const sampleAvatars = [
        'https://i.pravatar.cc/40?u=a', 'https://i.pravatar.cc/40?u=b', 'https://i.pravatar.cc/40?u=c',
        'https://i.pravatar.cc/40?u=d', 'https://i.pravatar.cc/40?u=e', 'https://i.pravatar.cc/40?u=f',
        'https://picsum.photos/40/40?image=10', // Cây cỏ
        'https://picsum.photos/40/40?image=20', // Hoa
        'https://picsum.photos/40/40?image=30', // Biển
        'https://picsum.photos/40/40?image=40', // Núi
        'https://picsum.photos/40/40?image=50', // Lá cây
        'https://picsum.photos/40/40?image=60'  // Giọt sương
    ];


    // --- CÁC HÀM TIỆN ÍCH ---
    const avatarColors = ['avatar-color-1', 'avatar-color-2', 'avatar-color-3', 'avatar-color-4', 'avatar-color-5', 'avatar-color-6'];
    
    // Hàm băm đơn giản để lấy màu cho avatar dựa trên tên
    function getColorClassForName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % avatarColors.length);
        return avatarColors[index];
    }

    // Hàm xử lý khi ảnh bị lỗi
    function handleImageError(event) {
        const placeholderText = "Ảnh đang được cập nhật.\nRất xin lỗi vì sự bất tiện này!";
        event.target.src = `https://via.placeholder.com/200x200/f0f0f0/808080?text=${encodeURIComponent(placeholderText)}`;
    }

    const menuItemsData = [
        {
            id: 'pho',
            name: 'Phở',
            price: 50000,
            image: 'images/Menu/Pho/pho.jpg',
            description: 'Món ăn truyền thống gồm bánh phở, nước dùng ninh từ xương (bò/gà) và gia vị (quế, hồi, thảo quả...), thịt, rau thơm.',
            variations: [
                { name: 'Phở xào (khô, không nước dùng)', image: 'images/Menu/Pho/phoxao.jpg' },
                { name: 'Phở cuốn', image: 'images/Menu/Pho/phocuon.png' },
                { name: 'Phở chiên phồng/trứng', image: 'images/Menu/Pho/phochienphong.jpg' }
            ],
            toppings: [
                { name: 'Tương ớt', image: 'images/Menu/TOPPING/tuongot.jpg' },
                { name: 'Tương đen (tương Hoisin)', image: 'images/Menu/TOPPING/tuongden.jpg' },
                { name: 'Chanh', image: 'images/Menu/TOPPING/chanh.jpg' },
                { name: 'Ớt tươi', image: 'images/Menu/TOPPING/ot.jpg' },
                { name: 'Giấm tỏi', image: 'images/Menu/TOPPING/giamtoi.jpg' },
                { name: 'Giá đỗ', image: 'images/Menu/TOPPING/giado.jpg' },
                { name: 'Rau thơm (húng quế, ngò gai)', image: 'images/Menu/TOPPING/rauthom.jpg' }
            ],
            comments: [
                { avatar: null, name: 'Anh Tuấn', text: 'Ngon tuyệt vời, nước dùng đậm đà khó cưỡng!', rating: 5 },
                { avatar: null, name: 'Chị Lan', text: 'Hương vị chuẩn Hà Nội, rất đáng thử.', rating: 5 },
                { avatar: null, name: 'Minh Anh', text: 'Thịt bò tươi, bánh phở mềm. Sẽ quay lại!', rating: 4 },
                { avatar: null, name: 'Quốc Bảo', text: 'Nước dùng ngọt thanh, không bị gắt vị mì chính.', rating: 5 },
                { avatar: null, name: 'Ngọc Diệp', text: 'Quán sạch sẽ, phục vụ nhanh nhẹn.', rating: 4 }
            ],
            rating: '★★★★☆'
        },
        {
            id: 'buncha',
            name: 'Bún Chả',
            price: 45000,
            image: 'images/Menu/Buncha/Buncha.jpg',
            description: 'Đặc sản Hà Nội, gồm bún tươi, chả thịt lợn băm và chả miếng nướng trên than hoa, ăn kèm với nước chấm chua ngọt.',
            variations: [
                { name: 'Bún chả que tre', image: 'images/Menu/Buncha/bunchaquetre.jpg' },
                { name: 'Bún chả lá lốt', image: 'images/Menu/Buncha/bunchalalot.jpg' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt (có đu đủ xanh hoặc cà rốt ngâm)', image: 'images/Menu/TOPPING/nuocchambuncha.jpg' },
                { name: 'Bún tươi', image: 'images/Menu/TOPPING/buntuoi.jpg' },
                { name: 'Rau sống (xà lách, tía tô, kinh giới, húng láng)', image: 'images/Menu/TOPPING/rausong.jpg' }
            ],
            comments: [
                { avatar: null, name: 'Hoàng Long', text: 'Chả nướng rất thơm, nước chấm vừa miệng.', rating: 5 },
                { avatar: null, name: 'Thanh Mai', text: 'Ăn một lần là nhớ mãi hương vị Hà Nội.', rating: 5 },
                { avatar: null, name: 'Anh Tuấn', text: 'Nem cua bể ở đây cũng rất ngon.', rating: 4 }
            ],
            rating: '★★★★★',
        },
        {
            id: 'banhmi',
            name: 'Bánh Mì',
            price: 25000,
            image: 'images/Menu/BanhMi/banhmi.jpg',
            description: 'Ổ bánh mì baguette vỏ giòn, bên trong có nhân đa dạng.',
            variations: [
                { name: 'Bánh mì thịt nướng', image: 'images/Menu/BanhMi/banhmithitnuong.jpg' },
                { name: 'Bánh mì xíu mại', image: 'images/Menu/BanhMi/banhmixiumai.jpg' },
                { name: 'Bánh mì ốp la', image: 'images/Menu/BanhMi/banhmiopla.jpg' },
                { name: 'Bánh mì chả lụa/thịt nguội', image: 'images/Menu/BanhMi/banhmicha.jpg' },
                { name: 'Bánh mì gà xé', image: 'images/Menu/BanhMi/banhmigaxe.jpg' }
            ],
            toppings: [
                { name: 'Pate', image: 'images/Menu/TOPPING/pate.jpg' },
                { name: 'Bơ', image: 'images/Menu/TOPPING/bo.jpg' },
                { name: 'Nước sốt/nước tương', image: 'images/Menu/TOPPING/nuocsotmi.jpg' },
                { name: 'Dưa chuột', image: 'images/Menu/TOPPING/duachuot.jpg' },
                { name: 'Ngò rí', image: 'images/Menu/TOPPING/ngo.jpg' },
                { name: 'Ớt', image: 'images/Menu/TOPPING/ot.jpg' }
            ],
            comments: [
                { avatar: null, name: 'Quốc Bảo', text: 'Vỏ giòn, nhân đầy đặn, một bữa sáng hoàn hảo.', rating: 5 },
                { avatar: null, name: 'Ngọc Diệp', text: 'Bánh mì ngon nhất mình từng ăn, pate rất thơm.', rating: 5 },
            ],
            rating: '★★★★★'
        },
        {
            id: 'comtam',
            name: 'Cơm Tấm',
            price: 55000,
            image: 'images/Menu/comtam/comtam.jpg',
            description: 'Món ăn từ gạo tấm (hạt gạo vỡ), phổ biến ở miền Nam, ăn kèm sườn nướng, chả trứng.',
            variations: [
                { name: 'Cơm tấm sườn bì chả', image: 'images/Menu/comtam/comtamsuonbicha.jpg' },
                { name: 'Cơm tấm thịt kho trứng', image: 'images/Menu/comtam/comtamthitkhotrung.png' },
                { name: 'Cơm tấm gà nướng', image: 'images/Menu/comtam/comtamganuong.jpg' }
            ],
            toppings: [
                { name: 'Nước mắm chua ngọt đặc trưng', image: 'images/Menu/TOPPING/nuocchamchuangot.jpg' },
                { name: 'Mỡ hành', image: 'images/Menu/TOPPING/mohanh.jpg' },
                { name: 'Đồ chua', image: 'images/Menu/TOPPING/dochua.jpg' },
                { name: 'Cà chua/dưa chuột', image: 'images/Menu/TOPPING/cachuaduachua.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-bo-hue',
            name: 'Bún Bò Huế',
            price: 50000,
            image: 'images/Menu/BunboHue/bunbohue.jpg',
            description: 'Món bún có nguồn gốc từ Huế, nước dùng đậm đà vị ruốc, sả, ớt, có màu đỏ của dầu điều.',
            variations: [
                { name: 'Bún bò giò heo', image: 'images/Menu/BunboHue/bunbogioheo.jpg' },
                { name: 'Bún bò chả cua', image: 'images/Menu/BunboHue/bunbochacua.jpg'},
                { name: 'Bún bò tái', image: 'images/Menu/BunboHue/bunbotai.jpg'},
                { name: 'Bún bò chay', image: 'images/Menu/BunboHue/bunbochay.jpg' }
            ],
            toppings: [
                { name: 'Rau sống (bắp chuối bào, giá đỗ, rau thơm)', image: 'images/Menu/TOPPING/rausong.jpg' },
                { name: 'Ớt chưng', image: 'images/Menu/TOPPING/ot.jpg' },
                { name: 'Mắm ruốc pha', image: 'images/Menu/TOPPING/mamruocpha.jpg' },
                { name: 'Chanh', image: 'images/Menu/TOPPING/chanh.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'cao-lau',
            name: 'Cao Lầu',
            price: 45000,
            image: 'images/Menu/caolau/img.jpg',
            description: 'Đặc sản Hội An, sợi mì màu vàng đặc trưng (làm bằng nước giếng Bá Lễ), ăn với thịt xá xíu, da heo chiên giòn và ít nước dùng.',
            variations: [
                { name: 'Cao lầu chay', image: 'images/Menu/caolau/caolauchay.jpg' },
                { name: 'Cao lầu truyền thống', image: 'images/Menu/caolau/caolautruyenthong.jpg' }
            ],
            toppings: [
                { name: 'Rau sống', image: 'images/Menu/TOPPING/rausong.jpg' },
                { name: 'Bánh đa/bánh vằn thắn chiên giòn', image: 'images/Menu/TOPPING/banhvanthanchiengion.jpg' },
                { name: 'Ớt', image: 'images/Menu/TOPPING/ot.jpg' },
                { name: 'Nước tương/nước mắm pha', image: 'images/Menu/TOPPING/nuocmam.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'mi-quang',
            name: 'Mì Quảng',
            price: 40000,
            image: 'images/Menu/Miquang/img.jpg',
            description: 'Đặc sản Quảng Nam, mì sợi dẹt, nước dùng sền sệt, đậm đà, ít nước, thường có tôm, thịt lợn, trứng cút.',
            variations: [
                { name: 'Mì Quảng gà', image: 'images/Menu/Miquang/miquangga.jpg' },
                { name: 'Mì Quảng tôm thịt', image: 'images/Menu/Miquang/miquangtomthit.jpg' },
                { name: 'Mì Quảng cá lóc', image: 'images/Menu/Miquang/miquangcaloc.jpg' },
                { name: 'Mì Quảng ếch', image: 'images/Menu/Miquang/miquangech.jpg' },
                { name: 'Mì Quảng chay', image: 'images/Menu/Miquang/miquangchay.jpg' }
            ],
            toppings: [
                { name: 'Bánh đa nướng (bánh tráng mè)', image: 'images/Menu/TOPPING/banhtrang.jpg' },
                { name: 'Đậu phộng rang', image: 'images/Menu/TOPPING/dauphongrang.jpg' },
                { name: 'Ớt', image: 'images/Menu/TOPPING/ot.jpg' },
                { name: 'Rau sống (cải con, xà lách, húng)', image: 'images/Menu/TOPPING/rausong.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-xeo',
            name: 'Bánh Xèo',
            price: 35000,
            image: 'images/Menu/banhxeo/img.jpg',
            description: 'Loại bánh làm từ bột gạo, nghệ, đổ mỏng, chiên giòn, nhân tôm, thịt, giá đỗ.',
            variations: [
                { name: 'Bánh xèo miền Tây (lớn, nhân nhiều rau, có nước cốt dừa)', image: 'images/Menu/banhxeo/banhxeomientay.jpg' },
                { name: 'Bánh xèo miền Trung (nhỏ, khuôn đúc)', image: 'images/Menu/banhxeo/banhxeomientrung.jpg' },
                { name: 'Bánh xèo tôm thịt', image: 'images/Menu/banhxeo/banhxeotomthit.jpg' },
                { name: 'Bánh xèo chay', image: 'images/Menu/banhxeo/banhxeochay.jpg' }
            ],
            toppings: [
                { name: 'Rau sống (cải bẹ xanh, xà lách, rau thơm)', image: 'images/Menu/TOPPING/rausong.jpg' },
                { name: 'Nước chấm chua ngọt', image: 'images/Menu/TOPPING/nuocchamchuangot.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'goi-cuon',
            name: 'Gỏi Cuốn',
            price: 30000,
            image: 'images/Menu/Goicuon/img.jpg',
            description: 'Món cuốn tươi mát, dùng bánh tráng cuốn tôm, thịt luộc, bún tươi và rau sống.',
            variations: [
                { name: 'Gỏi cuốn tôm thịt', image: 'images/Menu/Goicuon/goicuontomthit.jpg' },
                { name: 'Gỏi cuốn chay', image: 'images/Menu/Goicuon/goicuonchay.jpg' },
                { name: 'Gỏi cuốn bò bía (có củ sắn, lạp xưởng)', image: 'images/Menu/Goicuon/goicuonbobia.jpg' }
            ],
            toppings: [
                { name: 'Tương chấm (thường là tương đen pha đậu phộng)', image: 'images/Menu/TOPPING/tuongdauphong.jpg' },
                { name: 'Nước mắm chua ngọt', image: 'images/Menu/TOPPING/nuocchamchuangot.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-rieu-cua',
            name: 'Bún Riêu Cua',
            price: 45000,
            image: 'images/Menu/Bunrieucua/bunrieucua.jpg',
            description: 'Món bún với nước dùng riêu cua (gạch và thịt cua đồng giã), cà chua, có vị chua thanh.',
            variations: [
                { name: 'Bún riêu cua giò heo', image: 'images/Menu/Bunrieucua/bunrieucuagioheo.jpg' },
                { name: 'Bún riêu cua ốc', image: 'images/Menu/Bunrieucua/bunrieucuaoc.jpg' },
                { name: 'Bún riêu chay', image: 'images/Menu/Bunrieucua/bunrieucuachay.jpg' }
            ],
            toppings: [
                { name: 'Mắm tôm', image: 'images/Menu/TOPPING/mamtom.jpg' },
                { name: 'Rau muống chẻ', image: 'images/Menu/TOPPING/raumuongche.jpg' },
                { name: 'Giá đỗ', image: 'images/Menu/TOPPING/giado.jpg' },
                { name: 'Rau thơm', image: 'images/Menu/TOPPING/rauthom.jpg' },
                { name: 'Ớt chưng', image: 'images/Menu/TOPPING/ot.jpg' },
                { name: 'Chanh', image: 'images/Menu/TOPPING/chanh.jpg' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'cha-ca-la-vong',
            name: 'Chả Cá Lã Vọng',
            price: 70000,
            image: 'images/Menu/Chacalavong/chacalavong.jpg',
            description: 'Đặc sản Hà Nội, cá lăng/cá nheo thái miếng, ướp nghệ, mẻ, nướng và chiên trên chảo nóng cùng hành, thì là.',
            variations: [
                { name: 'Chả cá cuốn (ăn bằng cách cuốn chả cá với bún và rau)', image: 'https://via.placeholder.com/100x100?text=Cha+Ca+Cuon' },
                { name: 'Chả cá nướng', image: 'https://via.placeholder.com/100x100?text=Cha+Ca+Nuong' }
            ],
            toppings: [
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Mắm tôm pha chanh ớt', image: 'https://via.placeholder.com/100x100?text=Mam+Tom+Pha' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong+Rang' },
                { name: 'Rau thì là', image: 'https://via.placeholder.com/100x100?text=Rau+Thi+La' },
                { name: 'Hành lá', image: 'https://via.placeholder.com/100x100?text=Hanh+La' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-khot',
            name: 'Bánh Khọt',
            price: 35000,
            image: 'images/Menu/banhkhot/banhkhot.jpg',
            description: 'Bánh làm từ bột gạo pha nước cốt dừa, đúc trong khuôn nhỏ, có nhân tôm, chiên giòn.',
            variations: [
                { name: 'Bánh khọt Vũng Tàu (màu vàng, nhân tôm, có dừa nạo)', image: 'https://via.placeholder.com/100x100?text=Banh+Khot+Vung+Tau' },
                { name: 'Bánh khọt miền Trung (thường có nhân mực)', image: 'https://via.placeholder.com/100x100?text=Banh+Khot+Mien+Trung' }
            ],
            toppings: [
                { name: 'Rau sống (xà lách, cải bẹ xanh)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Nước mắm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Chua+Ngot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-dau-mam-tom',
            name: 'Bún Đậu Mắm Tôm',
            price: 50000,
            image: 'images/Menu/Bundaumamtom/bundaumamtom.jpg',
            description: 'Món ăn gồm bún lá, đậu phụ chiên giòn, chả cốm, dồi lợn, và đặc biệt là mắm tôm.',
            variations: [
                { name: 'Bún đậu thập cẩm', image: 'https://via.placeholder.com/100x100?text=Bun+Dau+Thap+Cam' },
                { name: 'Bún đậu chay (dùng chả chay, đậu hũ)', image: 'https://via.placeholder.com/100x100?text=Bun+Dau+Chay' }
            ],
            toppings: [
                { name: 'Mắm tôm (pha chanh, ớt, đường, dầu nóng)', image: 'https://via.placeholder.com/100x100?text=Mam+Tom' },
                { name: 'Rau kinh giới', image: 'https://via.placeholder.com/100x100?text=Rau+Kinh+Gioi' },
                { name: 'Tía tô', image: 'https://via.placeholder.com/100x100?text=Tia+To' },
                { name: 'Dưa chuột', image: 'https://via.placeholder.com/100x100?text=Dua+Chuot' },
                { name: 'Nem chua/nem rán', image: 'https://via.placeholder.com/100x100?text=Nem+Chua' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'nem-ran',
            name: 'Nem Rán (Chả Giò)',
            price: 40000,
            image: 'images/Menu/Nemran/nemran.jpg',
            description: 'Món cuốn từ bánh tráng với nhân thịt heo, tôm, miến, mộc nhĩ, cuốn lại và chiên giòn.',
            variations: [
                { name: 'Nem rán miền Bắc (nhân nhiều miến, trứng)', image: 'https://via.placeholder.com/100x100?text=Nem+Ran+Mien+Bac' },
                { name: 'Chả giò miền Nam (nhân có củ sắn, khoai môn)', image: 'https://via.placeholder.com/100x100?text=Cha+Gio+Mien+Nam' },
                { name: 'Chả giò rế', image: 'https://via.placeholder.com/100x100?text=Cha+Gio+Re' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Chua+Ngot' },
                { name: 'Bún', image: 'https://via.placeholder.com/100x100?text=Bun' },
                { name: 'Rau sống (xà lách, rau thơm)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bo-kho',
            name: 'Bò Kho',
            price: 60000,
            image: 'images/Menu/bokho/bokho.jpg',
            description: 'Thịt bò và cà rốt được hầm mềm trong nước dùng đậm vị sả, quế, hoa hồi, bột cà ri.',
            variations: [
                { name: 'Bò kho bánh mì', image: 'https://via.placeholder.com/100x100?text=Bo+Kho+Banh+Mi' },
                { name: 'Bò kho bún', image: 'https://via.placeholder.com/100x100?text=Bo+Kho+Bun' },
                { name: 'Bò kho cơm', image: 'https://via.placeholder.com/100x100?text=Bo+Kho+Com' }
            ],
            toppings: [
                { name: 'Bánh mì', image: 'https://via.placeholder.com/100x100?text=Banh+Mi' },
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Ngò rí', image: 'https://via.placeholder.com/100x100?text=Ngo+Ri' },
                { name: 'Hành tây', image: 'https://via.placeholder.com/100x100?text=Hanh+Tay' },
                { name: 'Rau quế', image: 'https://via.placeholder.com/100x100?text=Rau+Que' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-beo',
            name: 'Bánh Bèo',
            price: 30000,
            image: 'images/Menu/banhbeo/banhbeo.jpg',
            description: 'Bánh làm từ bột gạo, hấp trong chén nhỏ, có nhân tôm chấy, mỡ hành.',
            variations: [
                { name: 'Bánh bèo chén', image: 'https://via.placeholder.com/100x100?text=Banh+Beo+Chen' },
                { name: 'Bánh bèo đĩa (miền Bắc)', image: 'https://via.placeholder.com/100x100?text=Banh+Beo+Dia' }
            ],
            toppings: [
                { name: 'Nước mắm chua ngọt (thường có màu và vị đặc trưng từ tôm chấy)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Banh+Beo' },
                { name: 'Ớt tươi', image: 'https://via.placeholder.com/100x100?text=Ot+Tuoi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-bot-loc',
            name: 'Bánh Bột Lọc',
            price: 30000,
            image: 'images/Menu/banhbotloc/img.jpg',
            description: 'Bánh làm từ bột năng, trong suốt, nhân tôm và thịt lợn, được gói trong lá chuối hoặc để trần.',
            variations: [
                { name: 'Bánh bột lọc gói lá chuối (hấp)', image: 'https://via.placeholder.com/100x100?text=Banh+Bot+Loc+Goi' },
                { name: 'Bánh bột lọc trần (luộc)', image: 'https://via.placeholder.com/100x100?text=Banh+Bot+Loc+Tran' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt đặc trưng', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Banh+Loc' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'canh-chua-ca',
            name: 'Canh Chua Cá',
            price: 55000,
            image: 'images/Menu/Canhchuaca/canhchuaca.jpg',
            description: 'Món canh truyền thống miền Nam, vị chua ngọt đặc trưng của me, thơm, cà chua, và cay của ớt, dùng với cá (cá lóc, cá diêu hồng...).',
            variations: [
                { name: 'Canh chua tôm', image: 'https://via.placeholder.com/100x100?text=Canh+Chua+Tom' },
                { name: 'Canh chua lươn', image: 'https://via.placeholder.com/100x100?text=Canh+Chua+Luon' },
                { name: 'Canh chua thịt bằm', image: 'https://via.placeholder.com/100x100?text=Canh+Chua+Thit+Bam' },
                { name: 'Canh chua chay', image: 'https://via.placeholder.com/100x100?text=Canh+Chua+Chay' }
            ],
            toppings: [
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Nước mắm mặn', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Man' },
                { name: 'Rau thơm (ngò om, ngò gai)', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Giá đỗ', image: 'https://via.placeholder.com/100x100?text=Gia+Do' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'ca-ri-ga',
            name: 'Cà Ri Gà',
            price: 60000,
            image: 'images/Menu/Cariga/cariga.jpg',
            description: 'Món cà ri kiểu Việt, thịt gà hầm với khoai tây, cà rốt, nước cốt dừa, thơm mùi sả và bột cà ri.',
            variations: [
                { name: 'Cà ri vịt', image: 'https://via.placeholder.com/100x100?text=Ca+Ri+Vit' },
                { name: 'Cà ri dê', image: 'https://via.placeholder.com/100x100?text=Ca+Ri+De' },
                { name: 'Cà ri chay', image: 'https://via.placeholder.com/100x100?text=Ca+Ri+Chay' }
            ],
            toppings: [
                { name: 'Bánh mì', image: 'https://via.placeholder.com/100x100?text=Banh+Mi' },
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Cơm', image: 'https://via.placeholder.com/100x100?text=Com' },
                { name: 'Muối tiêu chanh (để chấm thịt gà)', image: 'https://via.placeholder.com/100x100?text=Muoi+Tieu+Chanh' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-cuon',
            name: 'Bánh Cuốn',
            price: 35000,
            image: 'images/Menu/banhcuon/img.jpg',
            description: 'Bánh làm từ bột gạo tráng mỏng, hấp chín, có nhân thịt heo băm, mộc nhĩ.',
            variations: [
                { name: 'Bánh cuốn trứng (tráng thêm trứng)', image: 'https://via.placeholder.com/100x100?text=Banh+Cuon+Trung' },
                { name: 'Bánh cuốn chả (ăn kèm chả lụa)', image: 'https://via.placeholder.com/100x100?text=Banh+Cuon+Cha' },
                { name: 'Bánh cuốn Thanh Trì (không nhân)', image: 'https://via.placeholder.com/100x100?text=Banh+Cuon+Thanh+Tri' }
            ],
            toppings: [
                { name: 'Nước chấm (nước mắm pha đường, giấm, tinh dầu cà cuống)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Banh+Cuon' },
                { name: 'Chả lụa', image: 'https://via.placeholder.com/100x100?text=Cha+Lua' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Rau thơm', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bo-la-lot',
            name: 'Bò Lá Lốt',
            price: 50000,
            image: 'images/Menu/Bolalot/bolalot.jpg',
            description: 'Thịt bò xay ướp gia vị, cuốn trong lá lốt và nướng trên than hồng.',
            variations: [
                { name: 'Bò cuốn mỡ chài', image: 'https://via.placeholder.com/100x100?text=Bo+Cuon+Mo+Chai' }
            ],
            toppings: [
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Bánh tráng', image: 'https://via.placeholder.com/100x100?text=Banh+Trang' },
                { name: 'Rau sống (xà lách, rau thơm)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Chuối chát', image: 'https://via.placeholder.com/100x100?text=Chuoi+Chat' },
                { name: 'Khế chua', image: 'https://via.placeholder.com/100x100?text=Khe+Chua' },
                { name: 'Nước chấm mắm nêm hoặc mắm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Mam+Nem' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-canh',
            name: 'Bánh Canh',
            price: 40000,
            image: 'images/Menu/banhcanh/banhcanh.jpg',
            description: 'Món nước dùng sợi bánh làm từ bột gạo/bột năng/bột lọc, nước dùng hầm xương.',
            variations: [
                { name: 'Bánh canh cua', image: 'https://via.placeholder.com/100x100?text=Banh+Canh+Cua' },
                { name: 'Bánh canh giò heo', image: 'https://via.placeholder.com/100x100?text=Banh+Canh+Gio+Heo' },
                { name: 'Bánh canh chả cá', image: 'https://via.placeholder.com/100x100?text=Banh+Canh+Cha+Ca' },
                { name: 'Bánh canh Trảng Bàng', image: 'https://via.placeholder.com/100x100?text=Banh+Canh+Trang+Bang' }
            ],
            toppings: [
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' },
                { name: 'Nước mắm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' },
                { name: 'Tiêu', image: 'https://via.placeholder.com/100x100?text=Tieu' },
                { name: 'Rau thơm (ngò rí, hành lá)', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'oc-luoc-xao',
            name: 'Ốc Luộc/Xào',
            price: 60000,
            image: 'images/Menu/ocluocxao/ocluocxao.jpg',
            description: 'Ốc (hương, mít, móng tay...) được luộc hoặc xào với các gia vị.',
            variations: [
                { name: 'Ốc luộc sả', image: 'https://via.placeholder.com/100x100?text=Oc+Luoc+Sa' },
                { name: 'Ốc xào me', image: 'https://via.placeholder.com/100x100?text=Oc+Xao+Me' },
                { name: 'Ốc xào dừa', image: 'https://via.placeholder.com/100x100?text=Oc+Xao+Dua' },
                { name: 'Ốc xào tỏi', image: 'https://via.placeholder.com/100x100?text=Oc+Xao+Toi' }
            ],
            toppings: [
                { name: 'Nước chấm mắm gừng sả ớt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Mam+Gung' },
                { name: 'Rau răm', image: 'https://via.placeholder.com/100x100?text=Rau+Ram' },
                { name: 'Bánh mì (để chấm nước xào)', image: 'https://via.placeholder.com/100x100?text=Banh+Mi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'lau-mam',
            name: 'Lẩu Mắm',
            price: 150000,
            image: 'images/Menu/laumam/laumam.jpg',
            description: 'Đặc sản miền Tây, lẩu nấu từ mắm cá linh/cá sặc, có vị mắm đặc trưng, ăn kèm thịt, cá, hải sản và nhiều loại rau.',
            variations: [
                { name: 'Lẩu mắm chay', image: 'https://via.placeholder.com/100x100?text=Lau+Mam+Chay' }
            ],
            toppings: [
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Rất nhiều loại rau (rau đắng, bông súng, kèo nèo, cà tím)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Ớt tươi', image: 'https://via.placeholder.com/100x100?text=Ot+Tuoi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'ga-nuong',
            name: 'Gà Nướng Mật Ong/Muối Ớt',
            price: 120000,
            image: 'images/Menu/ganuong/ganuong.jpg',
            description: 'Gà được tẩm ướp gia vị, mật ong/muối ớt và nướng trên than hoặc lò.',
            variations: [
                { name: 'Gà nướng lu', image: 'https://via.placeholder.com/100x100?text=Ga+Nuong+Lu' },
                { name: 'Gà nướng đất sét (Gà bọc đất)', image: 'https://via.placeholder.com/100x100?text=Ga+Nuong+Dat+Set' }
            ],
            toppings: [
                { name: 'Xôi nếp', image: 'https://via.placeholder.com/100x100?text=Xoi+Nep' },
                { name: 'Cơm lam', image: 'https://via.placeholder.com/100x100?text=Com+Lam' },
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Nước chấm muối tiêu chanh/muối ớt xanh', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Muoi+Tieu' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'thit-kho-tau',
            name: 'Thịt Kho Tàu',
            price: 50000,
            image: 'images/Menu/thitkhotau/thitkhotau.jpg',
            description: 'Thịt ba chỉ và trứng vịt/gà được kho nhừ trong nước dừa tươi, có màu cánh giá.',
            variations: [
                { name: 'Thịt kho tiêu', image: 'https://via.placeholder.com/100x100?text=Thit+Kho+Tieu' },
                { name: 'Thịt kho trứng cút', image: 'https://via.placeholder.com/100x100?text=Thit+Kho+Trung+Cut' }
            ],
            toppings: [
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Dưa giá', image: 'https://via.placeholder.com/100x100?text=Dua+Gia' },
                { name: 'Cải chua', image: 'https://via.placeholder.com/100x100?text=Cai+Chua' },
                { name: 'Canh', image: 'https://via.placeholder.com/100x100?text=Canh' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-bong-lan-trung-muoi',
            name: 'Bánh Bông Lan Trứng Muối',
            price: 30000,
            image: 'images/Menu/banhbonglantrungmuoi/banhbonglantrungmuoi.jpg',
            description: 'Bánh bông lan mềm, bên trên có lớp sốt phô mai/bơ và trứng muối, chà bông (ruốc).',
            variations: [
                { name: 'Bánh bông lan phô mai trứng muối', image: 'https://via.placeholder.com/100x100?text=Banh+Bong+Lan+Pho+Mai' },
                { name: 'Bánh bông lan cuộn trứng muối', image: 'https://via.placeholder.com/100x100?text=Banh+Bong+Lan+Cuon' }
            ],
            toppings: [
                { name: 'Chà bông (ruốc)', image: 'https://via.placeholder.com/100x100?text=Cha+Bong' },
                { name: 'Trứng muối', image: 'https://via.placeholder.com/100x100?text=Trung+Muoi' },
                { name: 'Phô mai', image: 'https://via.placeholder.com/100x100?text=Pho+Mai' },
                { name: 'Sốt bơ trứng', image: 'https://via.placeholder.com/100x100?text=Sot+Bo+Trung' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'hu-tieu',
            name: 'Hủ Tiếu',
            price: 45000,
            image: 'images/Menu/Hutieu/hutieu.jpg',
            description: 'Món ăn miền Nam, dùng sợi hủ tiếu (từ bột gạo/bột năng), nước dùng thanh ngọt.',
            variations: [
                { name: 'Hủ tiếu Nam Vang (có lòng, tôm, thịt)', image: 'https://via.placeholder.com/100x100?text=Hu+Tieu+Nam+Vang' },
                { name: 'Hủ tiếu Mỹ Tho (sợi dai)', image: 'https://via.placeholder.com/100x100?text=Hu+Tieu+My+Tho' },
                { name: 'Hủ tiếu khô', image: 'https://via.placeholder.com/100x100?text=Hu+Tieu+Kho' },
                { name: 'Hủ tiếu Sa Đéc', image: 'https://via.placeholder.com/100x100?text=Hu+Tieu+Sa+Dec' }
            ],
            toppings: [
                { name: 'Giá', image: 'https://via.placeholder.com/100x100?text=Gia' },
                { name: 'Hẹ', image: 'https://via.placeholder.com/100x100?text=He' },
                { name: 'Rau tần ô', image: 'https://via.placeholder.com/100x100?text=Rau+Tan+O' },
                { name: 'Xà lách', image: 'https://via.placeholder.com/100x100?text=Xa+Lach' },
                { name: 'Tương ớt', image: 'https://via.placeholder.com/100x100?text=Tuong+Ot' },
                { name: 'Tương đen', image: 'https://via.placeholder.com/100x100?text=Tuong+Den' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt tươi', image: 'https://via.placeholder.com/100x100?text=Ot+Tuoi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'che',
            name: 'Chè (Tổng quát)',
            price: 25000,
            image: 'images/Menu/Che/che.jpg',
            description: 'Món tráng miệng truyền thống, dạng lỏng, ngọt, có nhiều loại nguyên liệu.',
            variations: [
                { name: 'Chè trôi nước', image: 'https://via.placeholder.com/100x100?text=Che+Troi+Nuoc' },
                { name: 'Chè thập cẩm', image: 'https://via.placeholder.com/100x100?text=Che+Thap+Cam' },
                { name: 'Chè đậu đen', image: 'https://via.placeholder.com/100x100?text=Che+Dau+Den' },
                { name: 'Chè bưởi', image: 'https://via.placeholder.com/100x100?text=Che+Buoi' },
                { name: 'Chè sen', image: 'https://via.placeholder.com/100x100?text=Che+Sen' }
            ],
            toppings: [
                { name: 'Nước cốt dừa', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cot+Dua' },
                { name: 'Đá bào', image: 'https://via.placeholder.com/100x100?text=Da+Bao' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong+Rang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'xoi',
            name: 'Xôi',
            price: 30000,
            image: 'images/Menu/xoixeo/img.jpg',
            description: 'Món ăn từ gạo nếp được nấu/đồ chín.',
            variations: [
                { name: 'Xôi xéo (nếp đồ với nghệ, mỡ gà, đậu xanh)', image: 'https://via.placeholder.com/100x100?text=Xoi+Xeo' },
                { name: 'Xôi gấc', image: 'https://via.placeholder.com/100x100?text=Xoi+Gac' },
                { name: 'Xôi đỗ xanh', image: 'https://via.placeholder.com/100x100?text=Xoi+Do+Xanh' },
                { name: 'Xôi mặn', image: 'https://via.placeholder.com/100x100?text=Xoi+Man' }
            ],
            toppings: [
                { name: 'Chả lụa', image: 'https://via.placeholder.com/100x100?text=Cha+Lua' },
                { name: 'Ruốc (chà bông)', image: 'https://via.placeholder.com/100x100?text=Ruoc' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Trứng kho', image: 'https://via.placeholder.com/100x100?text=Trung+Kho' },
                { name: 'Lạp xưởng (đối với xôi mặn)', image: 'https://via.placeholder.com/100x100?text=Lap+Xuong' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-tet-banh-chung',
            name: 'Bánh Tét/Bánh Chưng',
            price: 80000,
            image: 'images/Menu/Banhtetbanhchung/banhtetbanhchung.jpg',
            description: 'Món bánh truyền thống dịp Tết, làm từ gạo nếp, đậu xanh, thịt lợn, gói trong lá dong/lá chuối.',
            variations: [
                { name: 'Bánh chưng nhân chay', image: 'https://via.placeholder.com/100x100?text=Banh+Chung+Chay' },
                { name: 'Bánh tét nhân chuối', image: 'https://via.placeholder.com/100x100?text=Banh+Tet+Chuoi' }
            ],
            toppings: [
                { name: 'Dưa hành/củ kiệu muối chua', image: 'https://via.placeholder.com/100x100?text=Dua+Hanh' },
                { name: 'Chả lụa', image: 'https://via.placeholder.com/100x100?text=Cha+Lua' },
                { name: 'Nước mắm tiêu', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Tieu' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-da-lon',
            name: 'Bánh Da Lợn',
            price: 20000,
            image: 'images/Menu/banhdalon/bandalon.jpg',
            description: 'Loại bánh ngọt dẻo, nhiều lớp, làm từ bột năng, bột gạo, nước cốt dừa, lá dứa, khoai môn.',
            variations: [
                { name: 'Bánh da lợn lá dứa', image: 'https://via.placeholder.com/100x100?text=Banh+Da+Lon+La+Dua' },
                { name: 'Bánh da lợn khoai môn', image: 'https://via.placeholder.com/100x100?text=Banh+Da+Lon+Khoai+Mon' }
            ],
            toppings: [
                { name: 'Thường ăn không hoặc kèm trà nóng', image: 'https://via.placeholder.com/100x100?text=An+Kem+Tra' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-ca',
            name: 'Bún Cá (Tổng quát)',
            price: 45000,
            image: 'images/Menu/Bunca/bunca.jpg',
            description: 'Món bún có nước dùng nấu từ xương cá hoặc đầu cá, và chả cá/cá tươi chiên/nấu.',
            variations: [
                { name: 'Bún cá rô đồng', image: 'https://via.placeholder.com/100x100?text=Bun+Ca+Ro+Dong' },
                { name: 'Bún chả cá Nha Trang', image: 'https://via.placeholder.com/100x100?text=Bun+Cha+Ca+Nha+Trang' },
                { name: 'Bún cá lóc miền Tây', image: 'https://via.placeholder.com/100x100?text=Bun+Ca+Loc+Mien+Tay' }
            ],
            toppings: [
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' },
                { name: 'Măng muối ớt', image: 'https://via.placeholder.com/100x100?text=Mang+Muoi+Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'long-xao-dua-chua',
            name: 'Lòng Xào Dưa Chua',
            price: 60000,
            image: 'images/Menu/longxaoduachua/longxaodua.jpg',
            description: 'Lòng lợn (non hoặc già) được làm sạch, xào với dưa cải muối chua.',
            variations: [
                { name: 'Lòng xào hành tây', image: 'https://via.placeholder.com/100x100?text=Long+Xao+Hanh+Tay' },
                { name: 'Lòng xào sả ớt', image: 'https://via.placeholder.com/100x100?text=Long+Xao+Sa+Ot' }
            ],
            toppings: [
                { name: 'Nước mắm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' },
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Ớt tươi', image: 'https://via.placeholder.com/100x100?text=Ot+Tuoi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'goi-nom',
            name: 'Gỏi (Nộm)',
            price: 50000,
            image: 'images/Menu/Goinom/goinom.jpg',
            description: 'Món salad kiểu Việt, nguyên liệu chính trộn với nước mắm chua ngọt, chanh, ớt.',
            variations: [
                { name: 'Gỏi gà xé phay', image: 'https://via.placeholder.com/100x100?text=Goi+Ga+Xe+Phay' },
                { name: 'Gỏi tai heo', image: 'https://via.placeholder.com/100x100?text=Goi+Tai+Heo' },
                { name: 'Gỏi ngó sen tôm thịt', image: 'https://via.placeholder.com/100x100?text=Goi+Ngo+Sen+Tom+Thit' },
                { name: 'Gỏi hoa chuối', image: 'https://via.placeholder.com/100x100?text=Goi+Hoa+Chuoi' }
            ],
            toppings: [
                { name: 'Bánh phồng tôm', image: 'https://via.placeholder.com/100x100?text=Banh+Phong+Tom' },
                { name: 'Bánh đa nướng', image: 'https://via.placeholder.com/100x100?text=Banh+Da+Nuong' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong+Rang' },
                { name: 'Rau thơm', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-gai',
            name: 'Bánh Gai',
            price: 20000,
            image: 'images/Menu/banhgai/banhgai.jpg',
            description: 'Bánh làm từ lá gai và bột nếp, nhân đậu xanh, dừa, bọc ngoài bằng lá chuối khô.',
            variations: [
                { name: 'Bánh gai nhân dừa', image: 'https://via.placeholder.com/100x100?text=Banh+Gai+Nhan+Dua' },
                { name: 'Bánh gai nhân đậu xanh không dừa', image: 'https://via.placeholder.com/100x100?text=Banh+Gai+Nhan+Dau+Xanh' }
            ],
            toppings: [
                { name: 'Thường ăn không hoặc kèm trà nóng', image: 'https://via.placeholder.com/100x100?text=An+Kem+Tra' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-pia',
            name: 'Bánh Pía',
            price: 25000,
            image: 'images/Menu/banhpia/banhpia.jpg',
            description: 'Bánh nướng hình tròn, nhiều lớp da mỏng, nhân đậu xanh, mỡ, sầu riêng (đặc trưng miền Tây).',
            variations: [
                { name: 'Bánh pía nhân sầu riêng', image: 'https://via.placeholder.com/100x100?text=Banh+Pia+Sau+Rieng' },
                { name: 'Bánh pía nhân khoai môn', image: 'https://via.placeholder.com/100x100?text=Banh+Pia+Khoai+Mon' }
            ],
            toppings: [
                { name: 'Thường ăn không hoặc kèm trà', image: 'https://via.placeholder.com/100x100?text=An+Kem+Tra' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'mam-kho',
            name: 'Mắm Kho',
            price: 60000,
            image: 'images/Menu/mamkho/mamkho.jpg',
            description: 'Món ăn miền Tây, nấu từ các loại mắm (cá linh, cá sặc) với thịt ba chỉ, sả, ớt.',
            variations: [
                { name: 'Mắm chưng (hỗn hợp mắm, thịt băm, trứng)', image: 'https://via.placeholder.com/100x100?text=Mam+Chung' },
                { name: 'Mắm sống', image: 'https://via.placeholder.com/100x100?text=Mam+Song' }
            ],
            toppings: [
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Rau luộc', image: 'https://via.placeholder.com/100x100?text=Rau+Luoc' },
                { name: 'Cà tím', image: 'https://via.placeholder.com/100x100?text=Ca+Tim' },
                { name: 'Ớt tươi', image: 'https://via.placeholder.com/100x100?text=Ot+Tuoi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'chao-long',
            name: 'Cháo Lòng',
            price: 40000,
            image: 'images/Menu/chaolong/chaolong.jpg',
            description: 'Cháo gạo nấu nhừ, ăn kèm lòng lợn (tim, gan, dồi, lưỡi...), huyết luộc.',
            variations: [
                { name: 'Cháo lòng miền Bắc (cháo trắng)', image: 'https://via.placeholder.com/100x100?text=Chao+Long+Mien+Bac' },
                { name: 'Cháo lòng miền Nam (cháo có màu sẫm hơn)', image: 'https://via.placeholder.com/100x100?text=Chao+Long+Mien+Nam' }
            ],
            toppings: [
                { name: 'Tiết', image: 'https://via.placeholder.com/100x100?text=Tiet' },
                { name: 'Hành lá', image: 'https://via.placeholder.com/100x100?text=Hanh+La' },
                { name: 'Ngò rí', image: 'https://via.placeholder.com/100x100?text=Ngo+Ri' },
                { name: 'Tiêu', image: 'https://via.placeholder.com/100x100?text=Tieu' },
                { name: 'Quẩy (bánh tiêu)', image: 'https://via.placeholder.com/100x100?text=Quay' },
                { name: 'Ớt bột', image: 'https://via.placeholder.com/100x100?text=Ot+Bot' },
                { name: 'Nước mắm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-gio',
            name: 'Bánh Giò',
            price: 25000,
            image: 'images/Menu/banhgio/banhgio.jpg',
            description: 'Bánh làm từ bột gạo tẻ, nhân thịt lợn băm, mộc nhĩ, gói trong lá chuối và hấp chín.',
            variations: [
                { name: 'Bánh giò chay', image: 'https://via.placeholder.com/100x100?text=Banh+Gio+Chay' }
            ],
            toppings: [
                { name: 'Chả lụa', image: 'https://via.placeholder.com/100x100?text=Cha+Lua' },
                { name: 'Giò tai', image: 'https://via.placeholder.com/100x100?text=Gio+Tai' },
                { name: 'Dưa chuột muối', image: 'https://via.placeholder.com/100x100?text=Dua+Chuot+Muoi' },
                { name: 'Tương ớt', image: 'https://via.placeholder.com/100x100?text=Tuong+Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-moc',
            name: 'Bún Mọc',
            price: 45000,
            image: 'images/Menu/bunmoc/bunmoc.jpg',
            description: 'Món bún có nước dùng hầm xương, topping chính là mọc (giò sống viên).',
            variations: [
                { name: 'Bún mọc sườn', image: 'https://via.placeholder.com/100x100?text=Bun+Moc+Suon' },
                { name: 'Bún mọc nấm', image: 'https://via.placeholder.com/100x100?text=Bun+Moc+Nam' }
            ],
            toppings: [
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' },
                { name: 'Măng khô hoặc măng tươi', image: 'https://via.placeholder.com/100x100?text=Mang+Kho' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'canh-rieu-ca',
            name: 'Canh Riêu Cá (Tổng quát)',
            price: 55000,
            image: 'images/Menu/canhrieuca/canhrieuca.jpg',
            description: 'Canh nấu với cá (thường là cá đồng), có vị chua của cà chua, me, hoặc dấm bỗng.',
            variations: [
                { name: 'Canh riêu cá chép', image: 'https://via.placeholder.com/100x100?text=Canh+Rieu+Ca+Chep' },
                { name: 'Canh riêu cá rô đồng', image: 'https://via.placeholder.com/100x100?text=Canh+Rieu+Ca+Ro+Dong' }
            ],
            toppings: [
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Mắm ớt', image: 'https://via.placeholder.com/100x100?text=Mam+Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-thit-nuong',
            name: 'Bún Thịt Nướng',
            price: 45000,
            image: 'images/Menu/bunthitnuong/bunthitnuong.jpg',
            description: 'Bún tươi, thịt lợn nướng tẩm ướp đậm đà, ăn kèm rau sống và nước chấm.',
            variations: [
                { name: 'Bún chả giò thịt nướng', image: 'https://via.placeholder.com/100x100?text=Bun+Cha+Gio+Thit+Nuong' },
                { name: 'Bún nem nướng (có thêm nem nướng)', image: 'https://via.placeholder.com/100x100?text=Bun+Nem+Nuong' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt (thường có đậu phộng xay)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Bun+Thit+Nuong' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong+Rang' },
                { name: 'Đồ chua (cà rốt, củ cải)', image: 'https://via.placeholder.com/100x100?text=Do+Chua' },
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-uot',
            name: 'Bánh Ướt',
            price: 30000,
            image: 'images/Menu/banhuot/banhuot.jpg',
            description: 'Bột gạo tráng mỏng như bánh cuốn nhưng không nhân, ăn kèm chả, nem.',
            variations: [
                { name: 'Bánh ướt chả lụa', image: 'https://via.placeholder.com/100x100?text=Banh+Uot+Cha+Lua' },
                { name: 'Bánh ướt lòng gà (miền Trung)', image: 'https://via.placeholder.com/100x100?text=Banh+Uot+Long+Ga' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Chua+Ngot' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Chả lụa/nem', image: 'https://via.placeholder.com/100x100?text=Cha+Lua' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'chao-vit-ga',
            name: 'Cháo Vịt/Gà',
            price: 40000,
            image: 'images/Menu/chaovit/chaovit.jpg',
            description: 'Cháo gạo nấu với thịt vịt hoặc thịt gà xé, có hành, tiêu.',
            variations: [
                { name: 'Cháo gà nấm', image: 'https://via.placeholder.com/100x100?text=Chao+Ga+Nam' },
                { name: 'Cháo vịt đậu xanh', image: 'https://via.placeholder.com/100x100?text=Chao+Vit+Dau+Xanh' }
            ],
            toppings: [
                { name: 'Gừng thái sợi', image: 'https://via.placeholder.com/100x100?text=Gung+Thai+Soi' },
                { name: 'Hành lá', image: 'https://via.placeholder.com/100x100?text=Hanh+La' },
                { name: 'Tiêu', image: 'https://via.placeholder.com/100x100?text=Tieu' },
                { name: 'Nước mắm gừng (để chấm thịt)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Gung' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'thang-co',
            name: 'Thắng Cố',
            price: 80000,
            image: 'images/Menu/thangco/thangco.jpg',
            description: 'Đặc sản vùng cao, nấu từ thịt và lục phủ ngũ tạng của ngựa (hoặc bò, lợn) cùng gia vị.',
            variations: [
                { name: 'Thắng cố ngựa (truyền thống)', image: 'https://via.placeholder.com/100x100?text=Thang+Co+Ngua' },
                { name: 'Thắng cố bò', image: 'https://via.placeholder.com/100x100?text=Thang+Co+Bo' }
            ],
            toppings: [
                { name: 'Rau rừng', image: 'https://via.placeholder.com/100x100?text=Rau+Rung' },
                { name: 'Ớt nướng', image: 'https://via.placeholder.com/100x100?text=Ot+Nuong' },
                { name: 'Tương ớt Mường Khương', image: 'https://via.placeholder.com/100x100?text=Tuong+Ot+Muong+Khuong' },
                { name: 'Rượu ngô', image: 'https://via.placeholder.com/100x100?text=Ruou+Ngo' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-tom-ho-tay',
            name: 'Bánh Tôm Hồ Tây',
            price: 35000,
            image: 'images/Menu/banhtom/banhtom.jpg',
            description: 'Bánh tôm tươi bọc bột chiên giòn, có nguồn gốc từ Hà Nội.',
            variations: [
                { name: 'Bánh tôm khoai lang', image: 'https://via.placeholder.com/100x100?text=Banh+Tom+Khoai+Lang' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Chua+Ngot' },
                { name: 'Rau sống (xà lách, rau thơm)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'canh-mang-vit',
            name: 'Canh Măng Vịt',
            price: 55000,
            image: 'images/Menu/canhmangvit/canhmangvit.jpg',
            description: 'Món canh/bún nước dùng nấu từ thịt vịt và măng tươi hoặc măng khô.',
            variations: [
                { name: 'Bún măng vịt', image: 'https://via.placeholder.com/100x100?text=Bun+Mang+Vit' }
            ],
            toppings: [
                { name: 'Rau thơm (ngò gai)', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Gừng', image: 'https://via.placeholder.com/100x100?text=Gung' },
                { name: 'Nước mắm gừng (chấm vịt)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Gung' },
                { name: 'Tiết luộc', image: 'https://via.placeholder.com/100x100?text=Tiet+Luoc' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-tam-bi',
            name: 'Bánh Tằm Bì',
            price: 40000,
            image: 'images/Menu/banhtambi/banhtambi.jpg',
            description: 'Món ăn miền Nam với sợi bánh tằm (làm từ bột gạo, dày hơn bún), ăn kèm bì heo trộn thính và nước cốt dừa.',
            variations: [
                { name: 'Bánh tằm cà ri (ăn với cà ri gà)', image: 'https://via.placeholder.com/100x100?text=Banh+Tam+Ca+Ri' },
                { name: 'Bánh tằm xíu mại', image: 'https://via.placeholder.com/100x100?text=Banh+Tam+Xiu+Mai' }
            ],
            toppings: [
                { name: 'Bì (da heo thái sợi trộn thính)', image: 'https://via.placeholder.com/100x100?text=Bi' },
                { name: 'Thịt heo quay/nướng', image: 'https://via.placeholder.com/100x100?text=Thit+Heo+Quay' },
                { name: 'Nước cốt dừa', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cot+Dua' },
                { name: 'Nước mắm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' },
                { name: 'Rau thơm', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Đồ chua', image: 'https://via.placeholder.com/100x100?text=Do+Chua' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-ken',
            name: 'Bún Kèn',
            price: 45000,
            image: 'images/Menu/bunken/bunken.jpg',
            description: 'Đặc sản Hà Tiên (Kiên Giang). Bún ăn với nước dùng đặc sệt nấu từ cá lóc xay, nước cốt dừa, và sả ớt.',
            variations: [
                { name: 'Bún kèn khô (ít nước dùng)', image: 'https://via.placeholder.com/100x100?text=Bun+Ken+Kho' }
            ],
            toppings: [
                { name: 'Rau thơm', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Giá đỗ', image: 'https://via.placeholder.com/100x100?text=Gia+Do' },
                { name: 'Dưa chuột thái sợi', image: 'https://via.placeholder.com/100x100?text=Dua+Chuot' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'don',
            name: 'Don',
            price: 35000,
            image: 'images/Menu/don/don.jpg',
            description: 'Đặc sản Quảng Ngãi. Món nước dùng nấu từ con don (giống hến, nhỏ hơn), ăn kèm với hành tây và bánh tráng mè nướng.',
            variations: [
                { name: 'Don xào (don xào khô)', image: 'https://via.placeholder.com/100x100?text=Don+Xao' }
            ],
            toppings: [
                { name: 'Bánh tráng mè nướng', image: 'https://via.placeholder.com/100x100?text=Banh+Trang+Me' },
                { name: 'Ớt xiêm xanh dầm', image: 'https://via.placeholder.com/100x100?text=Ot+Xiem' },
                { name: 'Hành tây', image: 'https://via.placeholder.com/100x100?text=Hanh+Tay' },
                { name: 'Ngò', image: 'https://via.placeholder.com/100x100?text=Ngo' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'long-heo-tiet-canh',
            name: 'Lòng Heo Tiết Canh',
            price: 70000,
            image: 'images/Menu/longheotietcanh/longheotietcanh.jpg',
            description: 'Món ăn gồm lòng heo luộc (dồi, tim, gan, phèo, phổi), ăn kèm bát tiết canh (tiết heo tươi đánh với nước mắm, đậu phộng).',
            variations: [
                { name: 'Lòng heo luộc thập cẩm', image: 'https://via.placeholder.com/100x100?text=Long+Heo+Thap+Cam' },
                { name: 'Tiết canh vịt/ngỗng', image: 'https://via.placeholder.com/100x100?text=Tiet+Canh+Vit' }
            ],
            toppings: [
                { name: 'Tiết canh', image: 'https://via.placeholder.com/100x100?text=Tiet+Canh' },
                { name: 'Rau húng', image: 'https://via.placeholder.com/100x100?text=Rau+Hung' },
                { name: 'Ngò gai', image: 'https://via.placeholder.com/100x100?text=Ngo+Gai' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' },
                { name: 'Nước mắm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' },
                { name: 'Bánh đa nướng', image: 'https://via.placeholder.com/100x100?text=Banh+Da' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-thang',
            name: 'Bún Thang',
            price: 55000,
            image: 'images/Menu/bunthang/bunthang.jpg',
            description: 'Đặc sản Hà Nội. Món bún nước dùng ninh từ xương, có topping cầu kỳ: trứng tráng mỏng, giò lụa, thịt gà xé, nấm hương.',
            variations: [],
            toppings: [
                { name: 'Trứng muối', image: 'https://via.placeholder.com/100x100?text=Trung+Muoi' },
                { name: 'Tôm khô', image: 'https://via.placeholder.com/100x100?text=Tom+Kho' },
                { name: 'Rau răm', image: 'https://via.placeholder.com/100x100?text=Rau+Ram' },
                { name: 'Tinh dầu cà cuống', image: 'https://via.placeholder.com/100x100?text=Ca+Cuong' },
                { name: 'Mắm tôm (tùy chọn)', image: 'https://via.placeholder.com/100x100?text=Mam+Tom' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'cha-ruoi',
            name: 'Chả Rươi',
            price: 60000,
            image: 'images/Menu/Placeholder/cha-ruoi.jpg',
            description: 'Món chả làm từ rươi (một loại giun biển), trộn với trứng, thịt băm, vỏ quýt, thì là rồi rán vàng.',
            variations: [
                { name: 'Rươi kho', image: 'https://via.placeholder.com/100x100?text=Ruoi+Kho' },
                { name: 'Mắm rươi', image: 'https://via.placeholder.com/100x100?text=Mam+Ruoi' }
            ],
            toppings: [
                { name: 'Rau thơm (thì là, húng)', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Bún lá', image: 'https://via.placeholder.com/100x100?text=Bun+La' },
                { name: 'Nước chấm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-duc',
            name: 'Bánh Đúc',
            price: 25000,
            image: 'images/Menu/Placeholder/banh-duc.jpg',
            description: 'Bánh làm từ bột gạo, có hai dạng: bánh đúc nóng (ăn với nhân thịt băm) và bánh đúc nguội (ăn với mắm nêm).',
            variations: [
                { name: 'Bánh đúc lạc (nhân đậu phộng)', image: 'https://via.placeholder.com/100x100?text=Banh+Duc+Lac' },
                { name: 'Bánh đúc nóng nhân thịt', image: 'https://via.placeholder.com/100x100?text=Banh+Duc+Nong' },
                { name: 'Bánh đúc lá dứa', image: 'https://via.placeholder.com/100x100?text=Banh+Duc+La+Dua' }
            ],
            toppings: [
                { name: 'Mắm nêm/tương bần', image: 'https://via.placeholder.com/100x100?text=Mam+Nem' },
                { name: 'Thịt băm xào', image: 'https://via.placeholder.com/100x100?text=Thit+Bam' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Rau sống (đối với bánh đúc nóng)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'mon-cuon-diep',
            name: 'Món Cuốn Diếp',
            price: 40000,
            image: 'images/Menu/Placeholder/mon-cuon-diep.jpg',
            description: 'Món cuốn đặc trưng miền Nam, nhân gồm thịt heo luộc, bún, tôm, cuốn bằng lá diếp cá tươi (hoặc xà lách) và chấm tương hột.',
            variations: [
                { name: 'Cuốn diếp chay', image: 'https://via.placeholder.com/100x100?text=Cuon+Diep+Chay' }
            ],
            toppings: [
                { name: 'Tương hột xay (chấm)', image: 'https://via.placeholder.com/100x100?text=Tuong+Hot' },
                { name: 'Ớt thái lát', image: 'https://via.placeholder.com/100x100?text=Ot+Thai+Lat' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'com-hen',
            name: 'Cơm Hến',
            price: 35000,
            image: 'images/Menu/Placeholder/com-hen.jpg',
            description: 'Đặc sản Huế. Cơm nguội trộn với hến xào, mắm ruốc, tóp mỡ, gia vị và nhiều loại rau thơm.',
            variations: [
                { name: 'Bún hến (dùng bún thay cơm)', image: 'https://via.placeholder.com/100x100?text=Bun+Hen' }
            ],
            toppings: [
                { name: 'Nước luộc hến nóng (chan kèm)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Hen' },
                { name: 'Tóp mỡ', image: 'https://via.placeholder.com/100x100?text=Top+Mo' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong' },
                { name: 'Chuối chát', image: 'https://via.placeholder.com/100x100?text=Chuoi+Chat' },
                { name: 'Khế chua', image: 'https://via.placeholder.com/100x100?text=Khe+Chua' },
                { name: 'Mắm ruốc', image: 'https://via.placeholder.com/100x100?text=Mam+Ruoc' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-can',
            name: 'Bánh Căn',
            price: 30000,
            image: 'images/Menu/Placeholder/banh-can.jpg',
            description: 'Bánh làm từ bột gạo, đúc bằng khuôn đất nung, nhân tôm, mực, trứng. Phổ biến ở miền Nam Trung Bộ.',
            variations: [
                { name: 'Bánh căn mực', image: 'https://via.placeholder.com/100x100?text=Banh+Can+Muc' },
                { name: 'Bánh căn trứng', image: 'https://via.placeholder.com/100x100?text=Banh+Can+Trung' }
            ],
            toppings: [
                { name: 'Nước chấm cá kho/nước mắm nêm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham' },
                { name: 'Mỡ hành', image: 'https://via.placeholder.com/100x100?text=Mo+Hanh' },
                { name: 'Đồ chua', image: 'https://via.placeholder.com/100x100?text=Do+Chua' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'nem-nuong-nha-trang',
            name: 'Nem Nướng Nha Trang',
            price: 50000,
            image: 'images/Menu/Placeholder/nem-nuong-nha-trang.jpg',
            description: 'Nem lụi (thịt heo xay nướng trên que tre) ăn kèm với bún, rau và nước chấm đặc biệt (tương nếp).',
            variations: [
                { name: 'Nem nướng cuốn bánh tráng', image: 'https://via.placeholder.com/100x100?text=Nem+Nuong+Cuon' },
                { name: 'Nem lụi Huế (nước chấm khác)', image: 'https://via.placeholder.com/100x100?text=Nem+Lui+Hue' }
            ],
            toppings: [
                { name: 'Bánh tráng', image: 'https://via.placeholder.com/100x100?text=Banh+Trang' },
                { name: 'Rau sống (xà lách, húng lủi)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Đồ chua', image: 'https://via.placeholder.com/100x100?text=Do+Chua' },
                { name: 'Dưa chuột', image: 'https://via.placeholder.com/100x100?text=Dua+Chuot' },
                { name: 'Nước chấm tương nếp đặc', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Tuong+Nep' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'che-kho',
            name: 'Chè Kho',
            price: 20000,
            image: 'images/Menu/Placeholder/che-kho.jpg',
            description: 'Món chè đặc, làm từ đậu xanh xay nhuyễn, nấu với đường và nước cốt dừa. Thường dùng trong các dịp cúng lễ ở miền Bắc.',
            variations: [
                { name: 'Chè kho hạt sen', image: 'https://via.placeholder.com/100x100?text=Che+Kho+Hat+Sen' }
            ],
            toppings: [
                { name: 'Vừng (mè) rang', image: 'https://via.placeholder.com/100x100?text=Vung+Rang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-phong-tom',
            name: 'Bánh Phồng Tôm',
            price: 25000,
            image: 'images/Menu/Placeholder/banh-phong-tom.jpg',
            description: 'Bánh làm từ bột năng, tôm tươi xay nhuyễn, gia vị, sau đó phơi khô và chiên phồng.',
            variations: [
                { name: 'Bánh phồng mực', image: 'https://via.placeholder.com/100x100?text=Banh+Phong+Muc' }
            ],
            toppings: [
                { name: 'Thường ăn không hoặc dùng kèm các món gỏi', image: 'https://via.placeholder.com/100x100?text=An+Kem+Goi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'canh-kho-qua-nhoi-thit',
            name: 'Canh Khổ Qua Nhồi Thịt',
            price: 45000,
            image: 'images/Menu/Placeholder/canh-kho-qua-nhoi-thit.jpg',
            description: 'Món canh truyền thống, trái khổ qua (mướp đắng) bỏ ruột, nhồi nhân thịt heo băm, mộc nhĩ rồi hầm mềm.',
            variations: [
                { name: 'Khổ qua hầm xương', image: 'https://via.placeholder.com/100x100?text=Kho+Qua+Ham+Xuong' }
            ],
            toppings: [
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Nước mắm tiêu', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Tieu' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-mam',
            name: 'Bún Mắm',
            price: 55000,
            image: 'images/Menu/Placeholder/bun-mam.jpg',
            description: 'Đặc sản miền Tây. Bún có nước lèo nấu từ mắm (cá linh, cá sặc), ăn kèm tôm, thịt heo quay/cá.',
            variations: [
                { name: 'Bún mắm chay', image: 'https://via.placeholder.com/100x100?text=Bun+Mam+Chay' }
            ],
            toppings: [
                { name: 'Rau đắng', image: 'https://via.placeholder.com/100x100?text=Rau+Dang' },
                { name: 'Bông súng', image: 'https://via.placeholder.com/100x100?text=Bong+Sung' },
                { name: 'Giá đỗ', image: 'https://via.placeholder.com/100x100?text=Gia+Do' },
                { name: 'Ớt tươi', image: 'https://via.placeholder.com/100x100?text=Ot+Tuoi' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'rau-muong-xao-toi',
            name: 'Rau Muống Xào Tỏi',
            price: 30000,
            image: 'images/Menu/Placeholder/rau-muong-xao-toi.jpg',
            description: 'Món rau đơn giản, phổ biến trong bữa cơm Việt, rau muống xào nhanh trên lửa lớn với tỏi.',
            variations: [
                { name: 'Rau muống xào chao', image: 'https://via.placeholder.com/100x100?text=Rau+Muong+Xao+Chao' },
                { name: 'Rau muống luộc chấm chanh', image: 'https://via.placeholder.com/100x100?text=Rau+Muong+Luoc' }
            ],
            toppings: [
                { name: 'Nước tương/nước mắm ớt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Tuong' },
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-ray',
            name: 'Bánh Rây',
            price: 20000,
            image: 'images/Menu/Placeholder/banh-ray.jpg',
            description: 'Đặc sản miền Trung. Bánh làm từ bột nếp, hấp chín, có nhân đậu xanh, dừa nạo, được rắc đường bên ngoài.',
            variations: [
                { name: 'Bánh rây nhân dừa', image: 'https://via.placeholder.com/100x100?text=Banh+Ray+Nhan+Dua' }
            ],
            toppings: [
                { name: 'Thường ăn không', image: 'https://via.placeholder.com/100x100?text=An+Khong' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'lau-bo-nhung-giam',
            name: 'Lẩu Bò Nhúng Giấm',
            price: 180000,
            image: 'images/Menu/Placeholder/lau-bo-nhung-giam.jpg',
            description: 'Lẩu dùng nước dùng chua nhẹ vị giấm, nhúng thịt bò thái mỏng cùng các loại rau sống.',
            variations: [
                { name: 'Bò nhúng mẻ (dùng mẻ thay giấm)', image: 'https://via.placeholder.com/100x100?text=Bo+Nhung+Me' }
            ],
            toppings: [
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Bánh tráng', image: 'https://via.placeholder.com/100x100?text=Banh+Trang' },
                { name: 'Rau sống (xà lách, chuối xanh, khế chua)', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Mắm nêm', image: 'https://via.placeholder.com/100x100?text=Mam+Nem' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-oc',
            name: 'Bún Ốc',
            price: 45000,
            image: 'images/Menu/Placeholder/bun-oc.jpg',
            description: 'Món bún có nước dùng chua thanh (từ cà chua, dấm bỗng), ăn kèm ốc bươu/ốc mít.',
            variations: [
                { name: 'Bún ốc nguội (bún không chan nước nóng)', image: 'https://via.placeholder.com/100x100?text=Bun+Oc+Nguoi' },
                { name: 'Bún ốc chuối đậu', image: 'https://via.placeholder.com/100x100?text=Bun+Oc+Chuoi+Dau' }
            ],
            toppings: [
                { name: 'Rau thơm', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Ớt chưng', image: 'https://via.placeholder.com/100x100?text=Ot+Chung' },
                { name: 'Mắm tôm (tùy chọn)', image: 'https://via.placeholder.com/100x100?text=Mam+Tom' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'pha-lau',
            name: 'Phá Lấu',
            price: 40000,
            image: 'images/Menu/Placeholder/pha-lau.jpg',
            description: 'Món ăn đường phố miền Nam. Lòng bò/heo được hầm mềm với nước dừa và ngũ vị hương.',
            variations: [
                { name: 'Phá lấu khô (xào sệt)', image: 'https://via.placeholder.com/100x100?text=Pha+Lau+Kho' },
                { name: 'Phá lấu mì gói', image: 'https://via.placeholder.com/100x100?text=Pha+Lau+Mi+Goi' }
            ],
            toppings: [
                { name: 'Bánh mì', image: 'https://via.placeholder.com/100x100?text=Banh+Mi' },
                { name: 'Mì gói', image: 'https://via.placeholder.com/100x100?text=Mi+Goi' },
                { name: 'Nước chấm me chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham+Me' },
                { name: 'Rau răm', image: 'https://via.placeholder.com/100x100?text=Rau+Ram' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'ca-phe-trung',
            name: 'Cà Phê Trứng',
            price: 35000,
            image: 'images/Menu/Placeholder/ca-phe-trung.jpg',
            description: 'Thức uống độc đáo Hà Nội. Cà phê đen phía dưới, phía trên là lớp kem làm từ lòng đỏ trứng gà đánh bông với đường.',
            variations: [
                { name: 'Cà phê trứng nóng', image: 'https://via.placeholder.com/100x100?text=Ca+Phe+Trung+Nong' },
                { name: 'Cà phê trứng đá', image: 'https://via.placeholder.com/100x100?text=Ca+Phe+Trung+Da' }
            ],
            toppings: [
                { name: 'Bột ca cao (rắc lên trên)', image: 'https://via.placeholder.com/100x100?text=Bot+Ca+Cao' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-trang-tron',
            name: 'Bánh Tráng Trộn',
            price: 25000,
            image: 'images/Menu/Placeholder/banh-trang-tron.jpg',
            description: 'Món ăn vặt phổ biến. Bánh tráng cắt sợi trộn với khô bò/gà, rau răm, xoài xanh, sa tế, nước sốt.',
            variations: [
                { name: 'Bánh tráng cuộn (cuốn lại thay vì trộn)', image: 'https://via.placeholder.com/100x100?text=Banh+Trang+Cuon' }
            ],
            toppings: [
                { name: 'Trứng cút', image: 'https://via.placeholder.com/100x100?text=Trung+Cut' },
                { name: 'Khô bò/gà', image: 'https://via.placeholder.com/100x100?text=Kho+Bo' },
                { name: 'Đậu phộng', image: 'https://via.placeholder.com/100x100?text=Dau+Phong' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Tắc (quất)', image: 'https://via.placeholder.com/100x100?text=Tac' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'thit-de-tai-chanh',
            name: 'Thịt Dê Tái Chanh',
            price: 90000,
            image: 'images/Menu/Placeholder/thit-de-tai-chanh.jpg',
            description: 'Thịt dê tươi trần tái, bóp với chanh, sả, lá chanh, gừng, tạo vị chua cay.',
            variations: [
                { name: 'Dê xào lăn', image: 'https://via.placeholder.com/100x100?text=De+Xao+Lan' },
                { name: 'Dê nướng tảng', image: 'https://via.placeholder.com/100x100?text=De+Nuong+Tang' }
            ],
            toppings: [
                { name: 'Lá sung', image: 'https://via.placeholder.com/100x100?text=La+Sung' },
                { name: 'Chuối xanh', image: 'https://via.placeholder.com/100x100?text=Chuoi+Xanh' },
                { name: 'Khế chua', image: 'https://via.placeholder.com/100x100?text=Khe+Chua' },
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Tương bần/nước chấm mắm nêm', image: 'https://via.placeholder.com/100x100?text=Tuong+Ban' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'nuoc-mam-pha-toi-ot',
            name: 'Nước Mắm Pha Tỏi Ớt',
            price: 5000,
            image: 'images/Menu/Placeholder/nuoc-mam-pha-toi-ot.jpg',
            description: 'Đây là loại nước chấm truyền thống của mọi bữa cơm Việt (được xem là linh hồn ẩm thực Việt).',
            variations: [
                { name: 'Nước mắm gừng', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Gung' },
                { name: 'Nước mắm chua ngọt (pha thêm giấm, đường)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam+Chua+Ngot' }
            ],
            toppings: [
                { name: 'Thường ăn kèm với cơm, rau luộc, hoặc làm nước chấm cho các món ăn khác', image: 'https://via.placeholder.com/100x100?text=An+Kem' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-tron',
            name: 'Bún Trộn',
            price: 40000,
            image: 'images/Menu/Placeholder/bun-tron.jpg',
            description: 'Món bún khô (không nước dùng), trộn với nước sốt, thịt, rau.',
            variations: [
                { name: 'Bún trộn gà', image: 'https://via.placeholder.com/100x100?text=Bun+Tron+Ga' },
                { name: 'Bún trộn bò', image: 'https://via.placeholder.com/100x100?text=Bun+Tron+Bo' }
            ],
            toppings: [
                { name: 'Thịt nướng/gà xé/bò xào', image: 'https://via.placeholder.com/100x100?text=Thit' },
                { name: 'Nước sốt trộn (chua ngọt)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Sot' },
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'canh-rieu-tom-chua',
            name: 'Canh Riêu Tôm Chua',
            price: 50000,
            image: 'images/Menu/Placeholder/canh-rieu-tom-chua.jpg',
            description: 'Canh nấu với tôm, có vị chua nhẹ (của khế hoặc me), và vị ngọt của tôm.',
            variations: [
                { name: 'Canh riêu tôm bầu', image: 'https://via.placeholder.com/100x100?text=Canh+Rieu+Tom+Bau' },
                { name: 'Canh riêu tôm rau đay', image: 'https://via.placeholder.com/100x100?text=Canh+Rieu+Tom+Rau+Day' }
            ],
            toppings: [
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' },
                { name: 'Cà pháo muối', image: 'https://via.placeholder.com/100x100?text=Ca+Phao' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-da-ke',
            name: 'Bánh Đa Kê',
            price: 15000,
            image: 'images/Menu/Placeholder/banh-da-ke.jpg',
            description: 'Đặc sản Hà Nội. Bánh đa nướng giòn rắc vừng, phết lớp kê đồ (kê đồ chín, dẻo), đường mật.',
            variations: [
                { name: 'Bánh đa kẹp chả', image: 'https://via.placeholder.com/100x100?text=Banh+Da+Kep+Cha' }
            ],
            toppings: [
                { name: 'Đường mật', image: 'https://via.placeholder.com/100x100?text=Duong+Mat' },
                { name: 'Kê đồ', image: 'https://via.placeholder.com/100x100?text=Ke+Do' },
                { name: 'Dừa nạo (tùy chọn)', image: 'https://via.placeholder.com/100x100?text=Dua+Nao' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'chao-suon',
            name: 'Cháo Sườn',
            price: 30000,
            image: 'images/Menu/Placeholder/chao-suon.jpg',
            description: 'Cháo gạo xay nhuyễn (hoặc nấu nhừ), nấu cùng sườn lợn băm nhỏ. Phổ biến ở miền Bắc.',
            variations: [
                { name: 'Cháo sườn đậu xanh', image: 'https://via.placeholder.com/100x100?text=Chao+Suon+Dau+Xanh' }
            ],
            toppings: [
                { name: 'Quẩy (bánh tiêu)', image: 'https://via.placeholder.com/100x100?text=Quay' },
                { name: 'Ruốc (chà bông)', image: 'https://via.placeholder.com/100x100?text=Ruoc' },
                { name: 'Tiêu', image: 'https://via.placeholder.com/100x100?text=Tieu' },
                { name: 'Ớt bột', image: 'https://via.placeholder.com/100x100?text=Ot+Bot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-bo',
            name: 'Bánh Bò',
            price: 20000,
            image: 'images/Menu/Placeholder/banh-bo.jpg',
            description: 'Bánh làm từ bột gạo/bột năng, nước cốt dừa, có vị ngọt, xốp.',
            variations: [
                { name: 'Bánh bò thốt nốt (có màu vàng và vị đặc trưng của đường thốt nốt)', image: 'https://via.placeholder.com/100x100?text=Banh+Bo+Thot+Not' },
                { name: 'Bánh bò rễ tre', image: 'https://via.placeholder.com/100x100?text=Banh+Bo+Re+Tre' }
            ],
            toppings: [
                { name: 'Nước cốt dừa', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cot+Dua' },
                { name: 'Mè rang (vừng)', image: 'https://via.placeholder.com/100x100?text=Me+Rang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-gia-cay',
            name: 'Bún Giả Cầy',
            price: 50000,
            image: 'images/Menu/Placeholder/bun-gia-cay.jpg',
            description: 'Bún ăn với thịt chân giò heo (giả làm thịt cầy) hầm mềm với riềng, mẻ, mắm tôm.',
            variations: [
                { name: 'Chân giò giả cầy nấu măng', image: 'https://via.placeholder.com/100x100?text=Gia+Cay+Nau+Mang' }
            ],
            toppings: [
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Mắm tôm', image: 'https://via.placeholder.com/100x100?text=Mam+Tom' },
                { name: 'Ớt chưng', image: 'https://via.placeholder.com/100x100?text=Ot+Chung' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'cha-gio-re',
            name: 'Chả Giò (thịt nướng) Rế',
            price: 45000,
            image: 'images/Menu/Placeholder/cha-gio-re.jpg',
            description: 'Nem rế (dùng bánh rế bọc bên ngoài) chiên giòn, nhân tôm thịt.',
            variations: [
                { name: 'Chả giò rế chay', image: 'https://via.placeholder.com/100x100?text=Cha+Gio+Re+Chay' }
            ],
            toppings: [
                { name: 'Bún', image: 'https://via.placeholder.com/100x100?text=Bun' },
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Nước chấm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-uot-chong',
            name: 'Bánh Ướt Chồng',
            price: 40000,
            image: 'images/Menu/Placeholder/banh-uot-chong.jpg',
            description: 'Đặc sản Đà Lạt. Bánh ướt nóng cuốn tôm khô, thịt gà xé, chả lụa và được xếp chồng lên nhau.',
            variations: [
                { name: 'Bánh ướt lòng gà', image: 'https://via.placeholder.com/100x100?text=Banh+Uot+Long+Ga' }
            ],
            toppings: [
                { name: 'Mỡ hành', image: 'https://via.placeholder.com/100x100?text=Mo+Hanh' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Nước mắm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' },
                { name: 'Thịt gà xé', image: 'https://via.placeholder.com/100x100?text=Thit+Ga+Xe' },
                { name: 'Lòng gà (hoặc chả lụa)', image: 'https://via.placeholder.com/100x100?text=Long+Ga' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-mi-chao',
            name: 'Bánh Mì Chảo',
            price: 45000,
            image: 'images/Menu/Placeholder/banh-mi-chao.jpg',
            description: 'Bánh mì ăn kèm với một chảo gang nhỏ gồm trứng ốp la, thịt xíu mại, pate, nước sốt.',
            variations: [
                { name: 'Bánh mì chảo bò', image: 'https://via.placeholder.com/100x100?text=Banh+Mi+Chao+Bo' },
                { name: 'Bánh mì chảo xúc xích', image: 'https://via.placeholder.com/100x100?text=Banh+Mi+Chao+Xuc+Xich' }
            ],
            toppings: [
                { name: 'Pate', image: 'https://via.placeholder.com/100x100?text=Pate' },
                { name: 'Xíu mại', image: 'https://via.placeholder.com/100x100?text=Xiu+Mai' },
                { name: 'Trứng ốp la', image: 'https://via.placeholder.com/100x100?text=Op+La' },
                { name: 'Nước sốt cà chua', image: 'https://via.placeholder.com/100x100?text=Nuoc+Sot' },
                { name: 'Tương ớt', image: 'https://via.placeholder.com/100x100?text=Tuong+Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-chuoi-chien',
            name: 'Bánh Chuối Chiên',
            price: 10000,
            image: 'images/Menu/Placeholder/banh-chuoi-chien.jpg',
            description: 'Chuối tây ép mỏng, bọc bột và chiên ngập dầu cho vàng giòn.',
            variations: [
                { name: 'Bánh khoai lang chiên', image: 'https://via.placeholder.com/100x100?text=Banh+Khoai+Chien' }
            ],
            toppings: [
                { name: 'Thường ăn không', image: 'https://via.placeholder.com/100x100?text=An+Khong' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'goi-ca-trich',
            name: 'Gỏi Cá Trích',
            price: 80000,
            image: 'images/Menu/Placeholder/goi-ca-trich.jpg',
            description: 'Đặc sản Phú Quốc. Cá trích tươi sống thái lát mỏng, trộn với hành tây, dừa nạo, ăn kèm rau rừng.',
            variations: [
                { name: 'Gỏi cá mai', image: 'https://via.placeholder.com/100x100?text=Goi+Ca+Mai' },
                { name: 'Gỏi cá mè', image: 'https://via.placeholder.com/100x100?text=Goi+Ca+Me' }
            ],
            toppings: [
                { name: 'Bánh tráng', image: 'https://via.placeholder.com/100x100?text=Banh+Trang' },
                { name: 'Rau rừng (lá đinh lăng, lá vọng cách)', image: 'https://via.placeholder.com/100x100?text=Rau+Rung' },
                { name: 'Nước chấm đặc biệt (mắm Phú Quốc)', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'rau-luoc-kho-quet',
            name: 'Rau Luộc Kho Quẹt',
            price: 40000,
            image: 'images/Menu/Placeholder/rau-luoc-kho-quet.jpg',
            description: 'Món rau củ (cải thảo, cà rốt, bầu, đậu bắp) luộc, chấm với kho quẹt (tương chấm mặn ngọt từ tôm khô, thịt ba chỉ, nước mắm).',
            variations: [
                { name: 'Rau luộc chấm muối vừng', image: 'https://via.placeholder.com/100x100?text=Rau+Luoc+Muoi+Vung' }
            ],
            toppings: [
                { name: 'Kho quẹt', image: 'https://via.placeholder.com/100x100?text=Kho+Quet' },
                { name: 'Cơm trắng cháy (để chấm kho quẹt)', image: 'https://via.placeholder.com/100x100?text=Com+Chay' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'cha-lua',
            name: 'Chả Lụa',
            price: 30000,
            image: 'images/Menu/Placeholder/cha-lua.jpg',
            description: 'Giò lụa, làm từ thịt heo nạc xay nhuyễn, gói trong lá chuối và luộc/hấp chín.',
            variations: [
                { name: 'Chả bò (giò bò)', image: 'https://via.placeholder.com/100x100?text=Cha+Bo' },
                { name: 'Giò thủ (giò xào)', image: 'https://via.placeholder.com/100x100?text=Gio+Thu' }
            ],
            toppings: [
                { name: 'Nước mắm', image: 'https://via.placeholder.com/100x100?text=Nuoc+Mam' },
                { name: 'Tiêu xay', image: 'https://via.placeholder.com/100x100?text=Tieu' },
                { name: 'Dùng kèm xôi, bánh mì, hoặc ăn không', image: 'https://via.placeholder.com/100x100?text=An+Kem' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-dap',
            name: 'Bánh Đập',
            price: 25000,
            image: 'images/Menu/Placeholder/banh-dap.jpg',
            description: 'Đặc sản miền Trung. Bánh tráng nướng kẹp bánh ướt ở giữa, đập dập và chấm mắm nêm.',
            variations: [
                { name: 'Bánh tráng cuốn thịt heo', image: 'https://via.placeholder.com/100x100?text=Banh+Trang+Cuon' }
            ],
            toppings: [
                { name: 'Mắm nêm', image: 'https://via.placeholder.com/100x100?text=Mam+Nem' },
                { name: 'Dầu hành', image: 'https://via.placeholder.com/100x100?text=Dau+Hanh' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'com-chay-ruoc',
            name: 'Cơm Cháy Ruốc',
            price: 35000,
            image: 'images/Menu/Placeholder/com-chay-ruoc.jpg',
            description: 'Cơm nấu chín, ép dẹt, sấy khô và chiên giòn, bên trên rắc ruốc (chà bông) và hành phi.',
            variations: [
                { name: 'Cơm cháy kho quẹt (chấm kho quẹt)', image: 'https://via.placeholder.com/100x100?text=Com+Chay+Kho+Quet' }
            ],
            toppings: [
                { name: 'Ruốc (chà bông)', image: 'https://via.placeholder.com/100x100?text=Ruoc' },
                { name: 'Hành phi', image: 'https://via.placeholder.com/100x100?text=Hanh+Phi' },
                { name: 'Tương ớt', image: 'https://via.placeholder.com/100x100?text=Tuong+Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-pho-chien-trung',
            name: 'Bánh Phở Chiên Trứng (Phở Áp Chảo)',
            price: 50000,
            image: 'images/Menu/Placeholder/banh-pho-chien-trung.jpg',
            description: 'Bánh phở được chiên/áp chảo giòn, ăn kèm thịt bò xào rau củ sền sệt.',
            variations: [
                { name: 'Phở chiên phồng', image: 'https://via.placeholder.com/100x100?text=Pho+Chien+Phong' }
            ],
            toppings: [
                { name: 'Nước sốt thịt bò xào', image: 'https://via.placeholder.com/100x100?text=Sot+Bo+Xao' },
                { name: 'Tương ớt', image: 'https://via.placeholder.com/100x100?text=Tuong+Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-long',
            name: 'Bún Lòng',
            price: 40000,
            image: 'images/Menu/Placeholder/bun-long.jpg',
            description: 'Bún ăn kèm với lòng lợn luộc, nước dùng thanh.',
            variations: [
                { name: 'Bún sườn (dùng sườn thay lòng)', image: 'https://via.placeholder.com/100x100?text=Bun+Suon' }
            ],
            toppings: [
                { name: 'Rau thơm', image: 'https://via.placeholder.com/100x100?text=Rau+Thom' },
                { name: 'Dấm tỏi ớt', image: 'https://via.placeholder.com/100x100?text=Dam+Toi+Ot' },
                { name: 'Mắm tôm (tùy chọn)', image: 'https://via.placeholder.com/100x100?text=Mam+Tom' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'thit-nuong-la-mac-mat',
            name: 'Thịt Nướng Lá Mắc Mật',
            price: 60000,
            image: 'images/Menu/Placeholder/thit-nuong-la-mac-mat.jpg',
            description: 'Thịt lợn ba chỉ tẩm ướp (thường là ở vùng Lạng Sơn), cuốn lá mắc mật và nướng.',
            variations: [
                { name: 'Vịt quay lá mắc mật', image: 'https://via.placeholder.com/100x100?text=Vit+Quay+La+Mac+Mat' }
            ],
            toppings: [
                { name: 'Nước chấm chua ngọt', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cham' },
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Cơm trắng/xôi', image: 'https://via.placeholder.com/100x100?text=Com+Xoi' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-phu-the',
            name: 'Bánh Phu Thê (Xu Xê)',
            price: 15000,
            image: 'images/Menu/Placeholder/banh-phu-the.jpg',
            description: 'Bánh ngọt truyền thống, vỏ ngoài trong suốt làm từ bột năng/nếp, nhân đậu xanh, dừa. Thường dùng trong đám cưới.',
            variations: [
                { name: 'Bánh phu thê lá dứa', image: 'https://via.placeholder.com/100x100?text=Banh+Phu+The+La+Dua' }
            ],
            toppings: [
                { name: 'Thường ăn không hoặc kèm trà', image: 'https://via.placeholder.com/100x100?text=An+Kem+Tra' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'canh-cua-rau-day',
            name: 'Canh Cua Rau Đay',
            price: 40000,
            image: 'images/Menu/Placeholder/canh-cua-rau-day.jpg',
            description: 'Món canh đồng quê miền Bắc. Nước dùng nấu từ riêu cua đồng, ăn kèm rau đay và mướp.',
            variations: [
                { name: 'Canh cua mùng tơi', image: 'https://via.placeholder.com/100x100?text=Canh+Cua+Mung+Toi' },
                { name: 'Canh riêu cua', image: 'https://via.placeholder.com/100x100?text=Canh+Rieu+Cua' }
            ],
            toppings: [
                { name: 'Cà pháo muối', image: 'https://via.placeholder.com/100x100?text=Ca+Phao' },
                { name: 'Cơm trắng', image: 'https://via.placeholder.com/100x100?text=Com+Trang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-chuoi-hap',
            name: 'Bánh Chuối Hấp',
            price: 20000,
            image: 'images/Menu/Placeholder/banh-chuoi-hap.jpg',
            description: 'Chuối xiêm trộn bột năng/bột sắn, hấp chín, ăn kèm nước cốt dừa.',
            variations: [
                { name: 'Bánh khoai mì hấp', image: 'https://via.placeholder.com/100x100?text=Banh+Khoai+Mi+Hap' }
            ],
            toppings: [
                { name: 'Nước cốt dừa', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cot+Dua' },
                { name: 'Đậu phộng rang', image: 'https://via.placeholder.com/100x100?text=Dau+Phong' },
                { name: 'Mè rang', image: 'https://via.placeholder.com/100x100?text=Me+Rang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'che-ba-mau',
            name: 'Chè Ba Màu (Chè Thái)',
            price: 25000,
            image: 'images/Menu/Placeholder/che-ba-mau.jpg',
            description: 'Món chè miền Nam, gồm nhiều loại thạch, đậu xanh, mít, ăn với nước cốt dừa và sữa.',
            variations: [
                { name: 'Chè sương sa hạt lựu', image: 'https://via.placeholder.com/100x100?text=Che+Suong+Sa' },
                { name: 'Chè thập cẩm', image: 'https://via.placeholder.com/100x100?text=Che+Thap+Cam' }
            ],
            toppings: [
                { name: 'Nước cốt dừa', image: 'https://via.placeholder.com/100x100?text=Nuoc+Cot+Dua' },
                { name: 'Đá bào', image: 'https://via.placeholder.com/100x100?text=Da+Bao' },
                { name: 'Trân châu', image: 'https://via.placeholder.com/100x100?text=Tran+Chau' },
                { name: 'Sầu riêng (tùy chọn)', image: 'https://via.placeholder.com/100x100?text=Sau+Rieng' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'bun-tom-mien-trung',
            name: 'Bún Tôm (miền Trung)',
            price: 45000,
            image: 'images/Menu/Placeholder/bun-tom-mien-trung.jpg',
            description: 'Bún với nước dùng nấu từ tôm tươi, có vị ngọt đậm của tôm.',
            variations: [
                { name: 'Bún tôm thịt', image: 'https://via.placeholder.com/100x100?text=Bun+Tom+Thit' },
                { name: 'Bún tôm khô', image: 'https://via.placeholder.com/100x100?text=Bun+Tom+Kho' }
            ],
            toppings: [
                { name: 'Rau sống', image: 'https://via.placeholder.com/100x100?text=Rau+Song' },
                { name: 'Chanh', image: 'https://via.placeholder.com/100x100?text=Chanh' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' },
                { name: 'Măng', image: 'https://via.placeholder.com/100x100?text=Mang' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'mon-cuon-thit-cho',
            name: 'Món Cuốn Thịt Chó (Dậu Mơ)',
            price: 100000,
            image: 'images/Menu/Placeholder/mon-cuon-thit-cho.jpg',
            description: 'Thịt chó thui (tùy vùng miền, hiện ít phổ biến hơn), luộc, nướng, hoặc xào, ăn kèm nhiều loại rau.',
            variations: [
                { name: 'Thịt chó nướng', image: 'https://via.placeholder.com/100x100?text=Thit+Cho+Nuong' },
                { name: 'Thịt chó xào sả ớt', image: 'https://via.placeholder.com/100x100?text=Thit+Cho+Xao' }
            ],
            toppings: [
                { name: 'Lá mơ', image: 'https://via.placeholder.com/100x100?text=La+Mo' },
                { name: 'Sả', image: 'https://via.placeholder.com/100x100?text=Sa' },
                { name: 'Gừng', image: 'https://via.placeholder.com/100x100?text=Gung' },
                { name: 'Mắm tôm đặc biệt', image: 'https://via.placeholder.com/100x100?text=Mam+Tom' },
                { name: 'Rượu', image: 'https://via.placeholder.com/100x100?text=Ruou' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'banh-da-lon-chien',
            name: 'Bánh Da Lợn Chiên',
            price: 25000,
            image: 'images/Menu/Placeholder/banh-da-lon-chien.jpg',
            description: 'Bánh da lợn (đã hấp chín) được cắt miếng và chiên giòn.',
            variations: [
                { name: 'Bánh bò chiên', image: 'https://via.placeholder.com/100x100?text=Banh+Bo+Chien' }
            ],
            toppings: [
                { name: 'Thường ăn kèm nước tương ớt hoặc nước cốt dừa', image: 'https://via.placeholder.com/100x100?text=An+Kem' }
            ],
            comments: [],
            rating: '★★★★☆'
        },
        {
            id: 'lau-ca-keo-la-giang',
            name: 'Lẩu Cá Kèo Lá Giang',
            price: 160000,
            image: 'images/Menu/Placeholder/lau-ca-keo-la-giang.jpg',
            description: 'Lẩu miền Tây, nước dùng chua thanh vị lá giang, ăn kèm cá kèo (loại cá da trơn nhỏ) và rau đắng.',
            variations: [
                { name: 'Lẩu cá lóc măng chua', image: 'https://via.placeholder.com/100x100?text=Lau+Ca+Loc' }
            ],
            toppings: [
                { name: 'Bún tươi', image: 'https://via.placeholder.com/100x100?text=Bun+Tuoi' },
                { name: 'Rau đắng', image: 'https://via.placeholder.com/100x100?text=Rau+Dang' },
                { name: 'Lá giang', image: 'https://via.placeholder.com/100x100?text=La+Giang' },
                { name: 'Ớt', image: 'https://via.placeholder.com/100x100?text=Ot' }
            ],
            comments: [],
            rating: '★★★★☆'
        }
    ];

    // --- TỰ ĐỘNG TẠO THÊM BÌNH LUẬN ẢO ---
    menuItemsData.forEach(item => {
        const desiredCommentCount = Math.floor(Math.random() * 5) + 11; // Tạo ngẫu nhiên từ 11-15 bình luận
        const existingCommentCount = item.comments.length;

        if (existingCommentCount < desiredCommentCount) {
            const commentsToAdd = desiredCommentCount - existingCommentCount;
            for (let i = 0; i < commentsToAdd; i++) {
                const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                const randomCommentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                const randomRating = Math.floor(Math.random() * 3) + 3; // Tạo rating ngẫu nhiên từ 3 đến 5 sao

                // Ngẫu nhiên chọn avatar dạng ảnh hoặc dạng chữ
                let randomAvatar = null;
                if (Math.random() > 0.4) { // 60% cơ hội có avatar ảnh
                    randomAvatar = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
                }

                item.comments.push({
                    avatar: randomAvatar,
                    name: randomName,
                    text: randomCommentText,
                    rating: randomRating
                });
            }
        }

        // Tính toán lại rating trung bình sau khi thêm bình luận
        const totalRating = item.comments.reduce((sum, comment) => sum + comment.rating, 0);
        const avgRating = item.comments.length > 0 ? Math.round(totalRating / item.comments.length) : 4; // Mặc định 4 sao nếu không có bình luận
        item.rating = '★'.repeat(avgRating) + '☆'.repeat(5 - avgRating);
    });

    // --- PHẦN 1: PHÁO HOA ---
    // (Giữ nguyên code pháo hoa)
    const fireworksTrigger = document.getElementById('fireworks-trigger');
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    let fireworks = null;
    const fireworksSoundFiles = [
        'https://fireworks.js.org/sounds/explosion0.mp3',
        'https://fireworks.js.org/sounds/explosion1.mp3',
        'https://fireworks.js.org/sounds/explosion2.mp3'
    ];

    fireworksTrigger.addEventListener('click', () => {
        if (!fireworks) {
            fireworks = new Fireworks.default(fireworksCanvas, {
                rocketsPoint: { min: 50, max: 50 },
                hue: { min: 0, max: 360 },
                delay: { min: 30, max: 60 },
                brightness: { min: 50, max: 80 },
                decay: { min: 0.015, max: 0.03 },
                flickering: 50,
                intensity: 5,
                friction: 0.97,
                gravity: 1.5,
                traceSpeed: 3,
                explosion: 5,
                sound: {
                    enabled: true,
                    files: [
                        ...fireworksSoundFiles], // Sử dụng spread operator để thêm các file âm thanh
                    volume: { min: 4, max: 8 }
                }
            });
        }

        fireworksCanvas.classList.add('active');
        fireworks.start();

        // Tự động dừng sau 10 giây
        setTimeout(() => {
            fireworks.stop();
            fireworksCanvas.classList.remove('active');
        }, 10000);
    });

    // Click vào nền đen để tắt pháo hoa
    fireworksCanvas.addEventListener('click', () => {
        if (fireworks) {
            fireworks.stop();
            fireworksCanvas.classList.remove('active');
        }
    });

    // --- PHẦN 2: BANNER SLIDE ---
    const sliderTrack = document.querySelector('.slider-track');
    const slides = Array.from(sliderTrack.children);
    const slideHeight = slides[0].getBoundingClientRect().height;
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;

    const moveToSlide = (track, targetIndex) => {
        track.style.transform = 'translateY(-' + slideHeight * targetIndex + 'px)';
        currentSlide = targetIndex;
    }

    nextBtn.addEventListener('click', () => {
        const nextSlide = (currentSlide + 1) % slides.length;
        moveToSlide(sliderTrack, nextSlide);
    });

    prevBtn.addEventListener('click', () => {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        moveToSlide(sliderTrack, prevSlide);
    });

    // Tự động trượt
    setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        moveToSlide(sliderTrack, nextSlide);
    }, 5000); // 5 giây

    // Cuộn chuột
    document.querySelector('.banner-slider-section').addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) { // Cuộn xuống
            nextBtn.click();
        } else { // Cuộn lên
            prevBtn.click();
        }
    });

    // --- PHẦN 3 & 4: TABS ---
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentContainer = document.querySelector('.content-sections-container');

    // Chuyển tab
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
    
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
    
            // Ẩn tất cả các section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
    
            // Hiển thị section tương ứng
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Menu toggle trên mobile
    navToggleBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('open');
    });

    // --- PHẦN ĐẶT HÀNG: VALIDATE SĐT ---
    const phoneInput = document.getElementById('customer-phone');
    const phoneError = document.getElementById('phone-error');
    phoneInput.addEventListener('input', () => {
        const phone = phoneInput.value;
        const isValid = (phone.length === 10 && phone.startsWith('0')) || (phone.length === 11 && phone.startsWith('84'));
        if (phone && !isValid) {
            phoneError.textContent = 'SĐT không hợp lệ (10 số bắt đầu bằng 0, hoặc 11 số bắt đầu bằng 84).';
        } else {
            phoneError.textContent = '';
        }
    });

    // Xử lý form
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!phoneError.textContent) {
            alert('Đã đặt hàng thành công!');
            orderForm.reset();
        } else {
            alert('Vui lòng kiểm tra lại thông tin.');
        }
    });
    orderForm.addEventListener('reset', () => {
        alert('Đã hủy toàn bộ nội dung.');
    });

    // --- PHẦN ĐẶT HÀNG: GIAO DIỆN MỚI ---
    const orderMenuList = document.getElementById('order-menu-list');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalContainer = document.getElementById('cart-total');
    let cart = {}; // { itemId: quantity }

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Hiển thị danh sách món ăn để chọn
    function renderOrderMenuList() {
        if (!orderMenuList) return;
        orderMenuList.innerHTML = '';
        menuItemsData.forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'order-menu-item';
            menuItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="handleImageError(event)">
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p>${formatCurrency(item.price)}</p>
                </div>
                <button class="add-to-cart-btn" data-item-id="${item.id}">+</button>
            `;
            orderMenuList.appendChild(menuItemDiv);
        });
    }

    // Cập nhật và hiển thị giỏ hàng
    function renderCart() {
        if (!cartItemsContainer || !cartTotalContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        const itemIds = Object.keys(cart);

        if (itemIds.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-message">Giỏ hàng đang trống</p>';
            cartTotalContainer.innerHTML = '';
            return;
        }

        itemIds.forEach(id => {
            const itemData = menuItemsData.find(item => item.id === id);
            const quantity = cart[id];
            total += itemData.price * quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <span class="cart-item-name">${itemData.name}</span>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease-btn" data-item-id="${id}">-</button>
                    <span class="cart-item-quantity">${quantity}</span>
                    <button class="quantity-btn increase-btn" data-item-id="${id}">+</button>
                </div>
                <span class="cart-item-price">${formatCurrency(itemData.price * quantity)}</span>
                <button class="remove-item-btn" data-item-id="${id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        cartTotalContainer.innerHTML = `
            <span>Tổng cộng:</span>
            <span>${formatCurrency(total)}</span>
        `;
    }

    // Xử lý sự kiện click nút "Thêm vào giỏ"
    if (orderMenuList) {
        orderMenuList.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const itemId = e.target.dataset.itemId;
                cart[itemId] = (cart[itemId] || 0) + 1;
                renderCart();
            }
        });
    }

    // Xử lý sự kiện click trên các nút trong giỏ hàng
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const itemId = target.dataset.itemId;
            if (!itemId) return;

            if (target.classList.contains('increase-btn')) {
                cart[itemId]++;
            } else if (target.classList.contains('decrease-btn')) {
                cart[itemId]--;
                if (cart[itemId] <= 0) delete cart[itemId];
            } else if (target.classList.contains('remove-item-btn')) {
                delete cart[itemId];
            }
            renderCart();
        });
    }

    // Xử lý hủy bỏ form
    orderForm.addEventListener('reset', () => {
        cart = {};
        renderCart();
    });

    // --- PHẦN ĐẶT HÀNG: TÌM KIẾM MÓN ĂN ---
    const searchOrderInput = document.getElementById('search-order-input');
    if (searchOrderInput) {
        searchOrderInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const orderItems = document.querySelectorAll('.order-menu-item');
            orderItems.forEach(item => {
                const itemName = item.querySelector('h4').textContent.toLowerCase();
                if (itemName.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    // Khởi tạo
    renderOrderMenuList();
    renderCart();

    // --- PHẦN THỰC ĐƠN: TÌM KIẾM ---
    const searchMenuInput = document.getElementById('search-menu-input');
    if (searchMenuInput) {
        // Sử dụng event delegation cho menu grid được tạo động
        searchMenuInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const menuItems = document.querySelectorAll('.menu-grid .menu-item');

            menuItems.forEach(item => {
                const itemName = item.querySelector('h3').textContent.toLowerCase();
                if (itemName.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // --- PHẦN ĐÁNH GIÁ: TÌM KIẾM ---
    const searchReviewInput = document.getElementById('search-review-input');
    if (searchReviewInput) {
        searchReviewInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const reviewSections = document.querySelectorAll('.dish-review-section');

            reviewSections.forEach(section => {
                const itemName = section.querySelector('h4').textContent.toLowerCase();
                const isMatch = itemName.includes(searchTerm);
                section.classList.toggle('hidden', !isMatch);
            });
        });
    }
    // --- PHẦN THỰC ĐƠN: HIỂN THỊ DANH SÁCH MÓN ĂN ---
    const menuGrid = document.querySelector('.menu-grid');

    function renderMenuGrid() {
        if (!menuGrid) return;

        menuGrid.innerHTML = ''; // Xóa nội dung cũ

        menuItemsData.forEach((item, index) => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'menu-item';
            menuItemDiv.dataset.itemId = item.id;
            // Thêm độ trễ cho hoạt ảnh để các thẻ xuất hiện lần lượt
            menuItemDiv.style.animationDelay = `${index * 0.05}s`;

            // Trích một phần mô tả ngắn
            const shortDescription = item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description;

            menuItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-item-bg-image" onerror="handleImageError(event)">
                <!-- Lớp phủ hiện ra khi hover -->
                <div class="menu-item-overlay">
                    <p>${shortDescription}</p>
                    <a href="#" class="detail-btn">Xem chi tiết</a>
                </div>

                <!-- Nội dung chính hiển thị mặc định -->
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p class="price">${formatCurrency(item.price)}</p>
                </div>
            `;

            menuGrid.appendChild(menuItemDiv);
        });

        // Cập nhật số lượng món ăn
        const menuCountSpan = document.getElementById('menu-count');
        if (menuCountSpan) {
            menuCountSpan.textContent = `${menuItemsData.length} món`;
        }
    }

    renderMenuGrid(); // Gọi hàm để hiển thị thực đơn khi tải trang

    // --- PHẦN ĐÁNH GIÁ: HIỂN THỊ THEO MÓN (ACCORDION) ---
    const reviewsContainer = document.getElementById('reviews-by-dish-container');

    function renderReviewsByDish() {
        if (!reviewsContainer) return;
        reviewsContainer.innerHTML = '';
        menuItemsData.forEach(item => {
            const section = document.createElement('div');
            section.className = 'dish-review-section';
            section.dataset.itemId = item.id; // Thêm ID để bắt sự kiện click

            let highlightHtml;

            if (item.comments.length > 0) {
                // Lấy một bình luận nổi bật (ưu tiên 5 sao)
                const highlightComment = item.comments.find(c => c.rating === 5) || item.comments[0];
                const shortCommentText = highlightComment.text.length > 120 ? highlightComment.text.substring(0, 120) + '...' : highlightComment.text;
                highlightHtml = `
                    <div class="highlight-comment">
                        <p>"${shortCommentText}"</p>
                        <strong>- ${highlightComment.name}</strong>
                    </div>
                    <div class="dish-review-footer">
                        <a href="#" class="view-all-reviews-btn">
                            Xem tất cả ${item.comments.length} đánh giá <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                `;
            } else {
                highlightHtml = `
                    <div class="highlight-comment no-comment">
                        <p>Chưa có đánh giá nào cho món này. Hãy là người đầu tiên!</p>
                    </div>
                `;
            }

            section.innerHTML = `
                <div class="dish-review-header">
                    <img src="${item.image}" alt="${item.name}" onerror="handleImageError(event)">
                    <div class="dish-review-header-info">
                        <h4>${item.name}</h4>
                        <div class="rating">${item.rating}</div>
                    </div>
                </div>
                <div class="dish-review-highlight">
                    ${highlightHtml}
                </div>
            `;
            reviewsContainer.appendChild(section);
        });

        // Cập nhật số lượng món ăn trong tab đánh giá
        const reviewCountSpan = document.getElementById('review-count');
        if (reviewCountSpan) {
            reviewCountSpan.textContent = `${menuItemsData.length} món`;
        }
    }

    // --- PHẦN THỰC ĐƠN: HIỂN THỊ CHI TIẾT MÓN ĂN (MODAL) ---
    const menuDetailModal = document.getElementById('menu-detail-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const detailItemImage = document.getElementById('detail-item-image');
    const detailItemName = document.getElementById('detail-item-name');
    const detailItemDescription = document.getElementById('detail-item-description');
    const detailItemVariations = document.getElementById('detail-item-variations');
    const detailItemToppings = document.getElementById('detail-item-toppings');
    const detailItemAllComments = document.getElementById('detail-item-all-comments');

    // Hàm hiển thị modal chi tiết món ăn
    function showMenuDetail(itemId) {
        const item = menuItemsData.find(data => data.id === itemId);
        if (!item) return;

        detailItemImage.src = item.image;
        detailItemImage.onerror = handleImageError;
        detailItemName.textContent = item.name;
        detailItemDescription.textContent = item.description;

        // Xóa nội dung cũ
        detailItemVariations.innerHTML = '';
        detailItemToppings.innerHTML = '';
        detailItemAllComments.innerHTML = '';

        // Thêm biến tấu
        item.variations.forEach(v => {
            const li = document.createElement('li');
            li.textContent = v.name;
            if (v.image) {
                const imgDiv = document.createElement('div');
                imgDiv.classList.add('variation-detail-image');
                imgDiv.innerHTML = `<img src="${v.image}" alt="${v.name}" onerror="handleImageError(event)">`;
                li.appendChild(imgDiv);
                li.addEventListener('mouseenter', () => imgDiv.style.display = 'block');
                li.addEventListener('mouseleave', () => imgDiv.style.display = 'none');
            }
            detailItemVariations.appendChild(li);
        });

        // Thêm topping/ăn kèm
        item.toppings.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t.name;
            if (t.image) {
                const imgDiv = document.createElement('div');
                imgDiv.classList.add('topping-detail-image');
                imgDiv.innerHTML = `<img src="${t.image}" alt="${t.name}" onerror="handleImageError(event)">`;
                li.appendChild(imgDiv);
                li.addEventListener('mouseenter', () => imgDiv.style.display = 'block');
                li.addEventListener('mouseleave', () => imgDiv.style.display = 'none');
            }
            detailItemToppings.appendChild(li);
        });

        // Thêm bình luận
        item.comments.forEach(c => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'full-comment-item'; // Thêm class để tạo kiểu

            let avatarHtml;
            if (c.avatar) {
                avatarHtml = `<img src="${c.avatar}" class="avatar" alt="avatar">`;
            } else {
                const initial = c.name.charAt(0).toUpperCase();
                const colorClass = getColorClassForName(c.name);
                avatarHtml = `<div class="avatar avatar-initial ${colorClass}">${initial}</div>`;
            }

            const ratingHtml = c.rating ? `<div class="individual-rating">${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</div>` : '';

            commentDiv.innerHTML = `
                ${avatarHtml} 
                <div class="comment-text">
                    <div class="comment-header"><strong>${c.name}</strong> ${ratingHtml}</div>
                    ${c.text}</div>`;
            detailItemAllComments.appendChild(commentDiv);
        });

        menuDetailModal.classList.add('active');
    }

    // Đóng modal
    closeModalBtn.addEventListener('click', () => {
        menuDetailModal.classList.remove('active');
    });

    // Đóng modal khi click vào vùng nền mờ bên ngoài
    menuDetailModal.addEventListener('click', (e) => {
        if (e.target === menuDetailModal) {
            menuDetailModal.classList.remove('active');
        }
    });

    // Lắng nghe sự kiện click vào ô món ăn (sử dụng event delegation)
    if (menuGrid) {
        menuGrid.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (!menuItem) return;
            const itemId = menuItem.dataset.itemId;
            showMenuDetail(itemId);
        });
    }

    // Khởi tạo tab đánh giá khi tải trang
    if (reviewsContainer) {
        renderReviewsByDish();
        // Thêm sự kiện click cho các thẻ đánh giá (dùng event delegation)
        reviewsContainer.addEventListener('click', (e) => {
            const reviewCard = e.target.closest('.dish-review-section');
            if (reviewCard) {
                e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
                const itemId = reviewCard.dataset.itemId;
                showMenuDetail(itemId);
            }
        });
    }

    // --- PHẦN THÔNG TIN NHÓM (MODAL) ---
    const logo = document.querySelector('.logo');
    const teamInfoModal = document.getElementById('team-info-modal');
    const closeTeamModalBtn = teamInfoModal.querySelector('.close-modal-btn');

    // Mở modal khi click vào logo
    logo.addEventListener('click', () => {
        teamInfoModal.classList.add('active');
    });

    // Đóng modal bằng nút 'X'
    closeTeamModalBtn.addEventListener('click', () => {
        teamInfoModal.classList.remove('active');
    });

    // Đóng modal khi click ra ngoài
    teamInfoModal.addEventListener('click', (e) => {
        if (e.target === teamInfoModal) {
            teamInfoModal.classList.remove('active');
        }
    });

    // --- PHẦN BỨC TƯỜNG ẢNH KHI CLICK VÀO TIÊU ĐỀ ---
    const brandTitle = document.querySelector('.brand-title');
    const imageWallOverlay = document.getElementById('image-wall-overlay');
    const closeImageWallBtn = document.getElementById('close-image-wall-btn');
    const imageWallGrid = document.getElementById('image-wall-grid');

    // Hàm thu thập tất cả ảnh từ banner và menu
    function getAllImagePaths() {
        const imagePaths = new Set(); // Dùng Set để tránh trùng lặp

        // Thêm ảnh banner
        for (let i = 1; i <= 11; i++) {
            imagePaths.add(`images/Banner/banner-slide-${i}.jpg`);
        }

        // Thêm ảnh từ dữ liệu món ăn (menuItemsData)
        menuItemsData.forEach(item => {
            // Thêm ảnh chính
            if (item.image && !item.image.includes('placeholder')) imagePaths.add(item.image);
            // Thêm ảnh các biến tấu
            item.variations.forEach(v => {
                if (v.image && !v.image.includes('placeholder')) imagePaths.add(v.image);
            });
            // Thêm ảnh các topping
            item.toppings.forEach(t => {
                if (t.image && !t.image.includes('placeholder')) imagePaths.add(t.image);
            });
        });

        return Array.from(imagePaths); // Chuyển Set thành Array
    }

    // Hàm xáo trộn mảng (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Mở và tạo "bức tường ảnh"
    brandTitle.addEventListener('click', () => {
        imageWallGrid.innerHTML = ''; // Xóa ảnh cũ
        const allImages = shuffleArray(getAllImagePaths());

        allImages.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Ảnh ẩm thực ${index + 1}`;
            img.onerror = handleImageError;
            img.style.animationDelay = `${index * 0.02}s`; // Tạo hiệu ứng xuất hiện lần lượt
            imageWallGrid.appendChild(img);
        });

        imageWallOverlay.classList.add('active');
    });

    // Đóng "bức tường ảnh"
    closeImageWallBtn.addEventListener('click', () => {
        imageWallOverlay.classList.remove('active');
    });

    // --- PHẦN HỖ TRỢ: FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = answer.style.maxHeight && answer.style.maxHeight !== '0px';
            
            answer.style.maxHeight = isActive ? '0px' : answer.scrollHeight + 'px';
            answer.style.padding = isActive ? '0 15px' : '0 15px 15px 15px';
        });
    });

    // --- NÚT QUAY LẠI ĐẦU TRANG ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const scrollableContent = document.querySelector('.scrollable-content-wrapper'); // Lấy khung cuộn

    if (scrollableContent && backToTopBtn) {
        scrollableContent.addEventListener('scroll', () => {
            if (scrollableContent.scrollTop > 200) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollableContent.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});