import Prompt, { PromptType } from '../models/Prompt';

export const seedPrompts = async () => {
    const existingCount = await Prompt.countDocuments();

    // Categorized Prompts based on 2026 Relationship Science
    const categoryPrompts = [
        // --- 1. Emotional Co-regulation & Nervous System ---
        { text: "Khi bạn cảm thấy bị kích động hoặc quá tải, hành động nào của mình giúp bạn cảm thấy hệ thần kinh được xoa dịu nhất?", tags: ['Co-regulation', 'Safety'] },
        { text: "Một dấu hiệu không lời nào cho mình biết rằng bạn đang cần sự hiện diện của mình?", tags: ['Attachment', 'Awareness'] },
        { text: "Chúng ta có thể làm gì để 'ngắt kết nối với thế giới' và 'kết nối với nhau' hiệu quả hơn vào mỗi cuối ngày?", tags: ['Digital Wellbeing', 'Intimacy'] },
        { text: "Điều gì trong cách mình lắng nghe khiến bạn cảm thấy thực sự được thấu hiểu?", tags: ['Communication', 'Growth'] },

        // --- 2. Growth Mindset & Future Vision ---
        { text: "Phiên bản tốt nhất của chính bạn mà bạn muốn mình hỗ trợ đạt được trong năm nay là gì?", tags: ['Growth', 'Aspiration'] },
        { text: "Nếu mối quan hệ của chúng ta là một dự án sáng tạo, bạn muốn chúng ta 'xây dựng' thêm tính năng nào cho nó?", tags: ['Vision', 'Creative'] },
        { text: "Một nỗi sợ về tương lai mà bạn muốn chúng ta cùng nhau đối mặt và hóa giải là gì?", tags: ['Growth', 'Vulnerability'] },
        { text: "Bạn thấy mình đã thay đổi tích cực nhất ở điểm nào kể từ khi chúng ta cùng thực hành 'Love Map'?", tags: ['Self-awareness', 'Progress'] },

        // --- 3. Digital Boundaries & Quality Time ---
        { text: "Quy tắc 'Digital-free zone' (vùng không thiết bị) lý tưởng của bạn cho chúng ta là khi nào?", tags: ['Boundaries', 'Quality Time'] },
        { text: "Một nội dung/video nào trên mạng xã hội khiến bạn nghĩ ngay đến mình gần đây nhất?", tags: ['Fun', 'Digital Share'] },
        { text: "Bạn muốn chúng ta dành 15 phút mỗi sáng để làm gì cùng nhau trước khi bắt đầu ngày làm việc bận rộn?", tags: ['Rituals', 'Connection'] },

        // --- 4. Deep Intimacy & Vulnerability ---
        { text: "Một góc khuất trong tâm hồn mà bạn hiếm khi chia sẻ với ai nhưng cảm thấy an toàn khi kể cho mình?", tags: ['Vulnerability', 'Deep Intimacy'] },
        { text: "Điều gì ở mình làm bạn thấy tự hào nhất khi giới thiệu mình với thế giới?", tags: ['Pride', 'Support'] },
        { text: "Cách mình thể hiện tình cảm 'âm thầm' nào mà bạn luôn trân trọng nhất?", tags: ['Appreciation', 'Silent Love'] },
        { text: "Kỷ niệm nào về sự yếu lòng của mình đã vô tình làm tăng thêm sự tin tưởng của bạn dành cho mình?", tags: ['Vulnerability', 'Trust'] },

        // --- 5. Playfulness & Fun ---
        { text: "Nếu chúng ta có 24 giờ 'vô lo vô nghĩ' và không giới hạn ngân sách, bạn sẽ muốn chúng ta đi đâu?", tags: ['Fun', 'Fantasy'] },
        { text: "Điều hài hước nhất mà chúng ta từng làm cùng nhau mà bạn vẫn hay nghĩ lại và mỉm cười?", tags: ['Joy', 'Memory'] },
        { text: "Nếu có thể đặt một biệt danh bí mật mới cho mình dựa trên một kỷ niệm gần đây, đó sẽ là gì?", tags: ['Fun', 'Inside Joke'] },

        // --- 6. Original Seed Prompts (Refined) ---
        { text: "Điều gì ở mình làm bạn cảm thấy được yêu thương nhất?", tags: ['Appreciation'] },
        { text: "Một kỉ niệm đẹp nhất của hai đứa mình là gì?", tags: ['Memory'] },
        { text: "Bạn thích nhất đặc điểm ngoại hình nào của mình?", tags: ['Attraction'] },
        { text: "Bạn thấy mình quyến rũ nhất khi nào?", tags: ['Attraction'] },
        { text: "Điều gì mà bạn luôn muốn thử cùng mình nhưng chưa có dịp?", tags: ['Fun'] },
        { text: "Bạn mơ ước điều gì cho tương lai của hai đứa?", tags: ['Vision'] },
        { text: "Một thói quen nhỏ của mình mà bạn thấy dễ thương là gì?", tags: ['Fun'] },
        { text: "Nếu hôm nay là ngày cuối cùng bên nhau, bạn sẽ muốn làm gì?", tags: ['Deep'] },
        { text: "Bạn tự hào về mình nhất ở điểm nào?", tags: ['Growth'] },
        { text: "Điều gì ở mình mà bạn thấy khó hiểu nhất?", tags: ['Understanding'] },
        { text: "Bạn thích mình mặc gì nhất?", tags: ['Attraction'] },
        { text: "Món ăn mình nấu mà bạn thích nhất là gì?", tags: ['Appreciation'] },
        { text: "Bạn cảm thấy bình yên nhất khi ở đâu cùng mình?", tags: ['Safety'] },
        { text: "Một bài hát gợi nhắc bạn về mình là gì?", tags: ['Memory'] },
        { text: "Lần đầu tiên bạn nhận ra mình yêu bạn là khi nào?", tags: ['Memory'] },
        { text: "Điều gì làm bạn cười nhiều nhất khi ở bên mình?", tags: ['Joy'] },
        { text: "Bạn thích cách mình chạm vào bạn ở đâu nhất?", tags: ['Intimacy'] },
        { text: "Một điều bạn muốn mình khen bạn nhiều hơn?", tags: ['Needs'] },
        { text: "Bạn thấy mình thay đổi thế nào từ khi yêu nhau?", tags: ['Growth'] },
        { text: "Nếu có thể thay đổi một điều ở mình (một cách nhẹ nhàng), đó là gì?", tags: ['Growth'] },
        { text: "Bạn thích đi du lịch ở đâu nhất cùng mình?", tags: ['Fun'] },
        { text: "Một bí mật nhỏ bạn chưa từng kể mình nghe?", tags: ['Vulnerability'] },
        { text: "Bạn cảm thấy mình hỗ trợ bạn tốt nhất ở việc gì?", tags: ['Support'] },
        { text: "Điều gì làm bạn cảm thấy bất an trong mối quan hệ này?", tags: ['Vulnerability'] },
        { text: "Bạn thích nhất lúc mình làm nũng không?", tags: ['Fun'] },
        { text: "Một hành động lãng mạn mà bạn mong đợi từ mình?", tags: ['Intimacy'] },
        { text: "Bạn thấy mình giống nhân vật nào trong phim/sách?", tags: ['Fun'] },
        { text: "Điều gì làm bạn thấy mình khác biệt với những người khác?", tags: ['Uniqueness'] },
        { text: "Bạn có thích cách hai đứa mình giải quyết mâu thuẫn không?", tags: ['Communication'] },
        { text: "Một lời khuyên về tình yêu mà bạn tâm đắc nhất?", tags: ['Wisdom'] },
        { text: "Bạn thấy mình đẹp nhất vào lúc nào trong ngày?", tags: ['Attraction'] },
        { text: "Điều gì làm bạn thấy mình là một cặp đôi ăn ý?", tags: ['Intimacy'] },
        { text: "Bạn có dự định gì cho kỷ niệm ngày yêu nhau sắp tới không?", tags: ['Vision'] },
        { text: "Một điều bạn học được từ mình?", tags: ['Growth'] },
        { text: "Bạn thấy mình đã giúp bạn trưởng thành hơn thế nào?", tags: ['Growth'] },
        { text: "Nếu được chọn lại, bạn vẫn chọn yêu mình chứ?", tags: ['Trust'] },
        { text: "Điều gì làm bạn thấy mình đáng tin cậy nhất?", tags: ['Trust'] },
        { text: "Bạn thích nhất lúc mình cười hay lúc mình trầm ngâm?", tags: ['Understanding'] },
        { text: "Một chủ đề mà bạn muốn hai đứa mình cùng thảo luận sâu hơn?", tags: ['Communication'] },
        { text: "Bạn thấy mình cần cải thiện điều gì để làm bạn hạnh phúc hơn?", tags: ['Growth'] },
        { text: "Một sở thích chung mà bạn rất quý trọng?", tags: ['Joy'] },
        { text: "Bạn cảm thấy thế nào khi mình giới thiệu bạn với bạn bè/gia đình?", tags: ['Safety'] },
        { text: "Điều gì làm bạn thấy mình là 'nhà' của nhau?", tags: ['Safety'] },
        { text: "Bạn thích nhất cách mình thể hiện tình cảm ở nơi công cộng không?", tags: ['Intimacy'] },
        { text: "Một câu nói của mình làm bạn nhớ mãi?", tags: ['Memory'] },
        { text: "Bạn thấy mình phản ứng thế nào khi bạn gặp khó khăn?", tags: ['Support'] },
        { text: "Điều gì làm bạn thấy mình là ưu tiên hàng đầu của mình?", tags: ['Trust'] },
        { text: "Bạn có thích cách mình chăm sóc bạn khi bạn ốm không?", tags: ['Appreciation'] },
        { text: "Một món quà mình tặng mà bạn trân trọng nhất?", tags: ['Memory'] },
        { text: "Bạn thấy mình có điểm gì giống với bố/mẹ mình không?", tags: ['Understanding'] },
        { text: "Điều gì làm bạn thấy mình là một người đặc biệt?", tags: ['Growth'] },
        { text: "Bạn thích nhất lúc mình nói chuyện về tương lai không?", tags: ['Vision'] },
        { text: "Một kỹ năng mà bạn muốn hai đứa cùng học?", tags: ['Fun'] },
        { text: "Bạn thấy mình xử lý áp lực công việc thế nào?", tags: ['Support'] },
        { text: "Điều gì làm bạn thấy mình luôn mới mẻ trong mắt bạn?", tags: ['Vision'] },
        { text: "Bạn có thích cách mình dành thời gian chất lượng cho nhau không?", tags: ['Quality Time'] },
        { text: "Một điều bạn muốn mình làm cho bạn vào cuối tuần này?", tags: ['Needs'] },
        { text: "Bạn thấy mình có sự thay đổi tích cực nào gần đây không?", tags: ['Growth'] },
        { text: "Điều gì làm bạn thấy mình là một phần không thể thiếu trong cuộc sống của bạn?", tags: ['Vision'] },
        { text: "Bạn mong muốn điều gì nhất ở mình trong tháng này?", tags: ['Needs'] }
    ];

    // For 2026 upgrade, we force re-seed if the count is old
    if (existingCount > 100) {
        console.log('Prompts already seeded with many items.');
        return;
    }

    console.log('Upgrading prompts to 2026 Psychology standards...');
    // Clear and re-seed 
    await Prompt.deleteMany({});

    const promptDocs = categoryPrompts.map(p => ({
        text: p.text,
        tags: p.tags,
        type: PromptType.LOVE_MAP,
        active: true
    }));

    await Prompt.insertMany(promptDocs);
    console.log(`Seeded ${promptDocs.length} high-quality Love Map prompts.`);
};
