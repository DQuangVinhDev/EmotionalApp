import Prompt, { PromptType } from '../models/Prompt';
import Card from '../models/Card';

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

export const seedCards = async () => {
    const existingCount = await Card.countDocuments();
    if (existingCount > 20) {
        console.log('Cards already seeded.');
        return;
    }

    console.log('Seeding full Couple Card Deck (v1)...');
    await Card.deleteMany({});

    const cards = [
        // ======================
        // LEVEL 1 – WARMUP
        // ======================
        {
            level: 1,
            category: "Warmup",
            prompt: "Hôm nay mức năng lượng của bạn từ 0–10 là bao nhiêu?",
            followups: [
                "Điều gì ảnh hưởng nhiều nhất đến con số đó?",
                "Mình có thể làm gì nhỏ để bạn dễ chịu hơn ngay lúc này?"
            ],
            flags: ["safe"]
        },
        {
            level: 1,
            category: "Warmup",
            prompt: "Một khoảnh khắc nhỏ gần đây khiến bạn mỉm cười khi nghĩ đến mình là gì?",
            followups: [
                "Điều gì làm khoảnh khắc đó trở nên đặc biệt?",
                "Bạn muốn điều đó lặp lại khi nào?"
            ],
            flags: ["safe"]
        },
        {
            level: 1,
            category: "Self",
            prompt: "Khi căng thẳng, bạn thường cần điều gì nhất: không gian, lắng nghe hay giải pháp?",
            followups: [
                "Dấu hiệu nào cho thấy bạn đang căng thẳng?",
                "Một điều mình nên tránh làm lúc đó là gì?"
            ],
            flags: ["safe"]
        },
        {
            level: 1,
            category: "Us",
            prompt: "Một điều nhỏ mình làm khiến bạn cảm thấy được yêu thương là gì?",
            followups: [
                "Vì sao điều đó quan trọng với bạn?",
                "Mình nên làm điều đó với tần suất thế nào?"
            ],
            flags: ["safe"]
        },

        // ======================
        // LEVEL 2 – DEEPER CONNECTION
        // ======================
        {
            level: 2,
            category: "Values",
            prompt: "Với bạn, một mối quan hệ tốt cần có 3 yếu tố nào quan trọng nhất?",
            followups: [
                "Yếu tố nào bạn lo sẽ thiếu nhất trong tương lai?",
                "Mình đang làm tốt và chưa tốt ở điểm nào?"
            ],
            flags: ["deep"]
        },
        {
            level: 2,
            category: "Us",
            prompt: "Một thói quen nhỏ của mình đôi khi làm bạn khó chịu nhưng bạn thường bỏ qua là gì?",
            followups: [
                "Mức độ khó chịu của bạn từ 0–10?",
                "Nếu mình thay đổi 1% thôi, bạn muốn đó là gì?"
            ],
            flags: ["deep", "consent"]
        },
        {
            level: 2,
            category: "Conflict",
            prompt: "Khi chúng ta cãi nhau, điều bạn sợ nhất lúc đó là gì?",
            followups: [
                "Bạn thường phản ứng thế nào khi có nỗi sợ đó?",
                "Mình có thể giúp bạn cảm thấy an toàn hơn bằng cách nào?"
            ],
            flags: ["deep", "consent"]
        },
        {
            level: 2,
            category: "Intimacy",
            prompt: "Bạn cảm thấy gần gũi nhất với mình khi chúng ta làm điều gì cùng nhau?",
            followups: [
                "Điều đó cần không gian hoặc thời gian như thế nào?",
                "Có điều gì gần đây làm bạn khó mở lòng hơn không?"
            ],
            flags: ["deep", "consent"]
        },

        // ======================
        // LEVEL 3 – VULNERABILITY & REPAIR
        // ======================
        {
            level: 3,
            category: "Conflict",
            prompt: "Một câu nói hoặc hành động của mình từng làm bạn tổn thương mà mình có thể không nhận ra là gì?",
            followups: [
                "Lúc đó bạn đã diễn giải điều đó như thế nào?",
                "Lần sau bạn muốn mình phản hồi ra sao?"
            ],
            flags: ["deep", "consent", "repair"]
        },
        {
            level: 3,
            category: "Self",
            prompt: "Một nỗi sợ sâu bên trong mà bạn hiếm khi chia sẻ với người khác là gì?",
            followups: [
                "Điều gì khiến nỗi sợ đó hình thành?",
                "Mình có thể đồng hành với bạn thế nào khi nó xuất hiện?"
            ],
            flags: ["deep", "consent"]
        },
        {
            level: 3,
            category: "Values",
            prompt: "Nếu nhìn về 2–3 năm tới, bạn mong mối quan hệ của chúng ta sẽ khác bây giờ ở điểm nào?",
            followups: [
                "Điều gì khiến bạn mong muốn sự thay đổi đó?",
                "Bước nhỏ đầu tiên chúng ta có thể làm là gì?"
            ],
            flags: ["deep"]
        },

        // ======================
        // ACTION & RITUALS
        // ======================
        {
            level: 1,
            category: "Action",
            prompt: "Chọn một nghi thức 10 phút mỗi ngày cho chúng ta (ví dụ: đi bộ, ôm, trò chuyện trước khi ngủ).",
            followups: [
                "Khung giờ nào thực tế nhất?",
                "Điều gì có thể khiến nghi thức này bị gián đoạn?"
            ],
            flags: ["action", "safe"]
        },
        {
            level: 2,
            category: "Action",
            prompt: "Tuần này, bạn muốn mình thể hiện tình yêu với bạn bằng hành động cụ thể nào?",
            followups: [
                "Làm thế nào để mình biết bạn thật sự cảm nhận được?",
                "Có điều gì mình nên tránh để không phản tác dụng?"
            ],
            flags: ["action"]
        },
        {
            level: 3,
            category: "Action",
            prompt: "Nếu chúng ta có một 'quy ước khi cãi nhau' gồm 3 điều, bạn muốn 3 điều đó là gì?",
            followups: [
                "Một tín hiệu nào có nghĩa là cần tạm dừng?",
                "Sau khi bình tĩnh, chúng ta quay lại nói chuyện như thế nào?"
            ],
            flags: ["action", "repair", "consent"]
        }
    ];

    await Card.insertMany(cards);
    console.log(`Seeded ${cards.length} cards for full Couple Card Deck.`);
};
