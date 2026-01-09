import Prompt, { PromptType } from '../models/Prompt';

export const seedPrompts = async () => {
    const count = await Prompt.countDocuments();
    if (count > 0) return;

    const prompts = [
        "Điều gì ở mình làm bạn cảm thấy được yêu thương nhất?",
        "Một kỉ niệm đẹp nhất của hai đứa mình là gì?",
        "Bạn thích nhất đặc điểm ngoại hình nào của mình?",
        "Bạn thấy mình quyến rũ nhất khi nào?",
        "Điều gì mà bạn luôn muốn thử cùng mình nhưng chưa có dịp?",
        "Bạn mơ ước điều gì cho tương lai của hai đứa?",
        "Một thói quen nhỏ của mình mà bạn thấy dễ thương là gì?",
        "Nếu hôm nay là ngày cuối cùng bên nhau, bạn sẽ muốn làm gì?",
        "Bạn tự hào về mình nhất ở điểm nào?",
        "Điều gì ở mình mà bạn thấy khó hiểu nhất?",
        "Bạn thích mình mặc gì nhất?",
        "Món ăn mình nấu mà bạn thích nhất là gì?",
        "Bạn cảm thấy bình yên nhất khi ở đâu cùng mình?",
        "Một bài hát gợi nhắc bạn về mình là gì?",
        "Lần đầu tiên bạn nhận ra mình yêu bạn là khi nào?",
        "Điều gì làm bạn cười nhiều nhất khi ở bên mình?",
        "Bạn thích cách mình chạm vào bạn ở đâu nhất?",
        "Một điều bạn muốn mình khen bạn nhiều hơn?",
        "Bạn thấy mình thay đổi thế nào từ khi yêu nhau?",
        "Nếu có thể thay đổi một điều ở mình (một cách nhẹ nhàng), đó là gì?",
        "Bạn thích đi du lịch ở đâu nhất cùng mình?",
        "Một bí mật nhỏ bạn chưa từng kể mình nghe?",
        "Bạn cảm thấy mình hỗ trợ bạn tốt nhất ở việc gì?",
        "Điều gì làm bạn cảm thấy bất an trong mối quan hệ này?",
        "Bạn thích nhất lúc mình làm nũng không?",
        "Một hành động lãng mạn mà bạn mong đợi từ mình?",
        "Bạn thấy mình giống nhân vật nào trong phim/sách?",
        "Điều gì làm bạn thấy mình khác biệt với những người khác?",
        "Bạn có thích cách hai đứa mình giải quyết mâu thuẫn không?",
        "Một lời khuyên về tình yêu mà bạn tâm đắc nhất?",
        "Bạn thấy mình đẹp nhất vào lúc nào trong ngày?",
        "Điều gì làm bạn thấy mình là một cặp đôi ăn ý?",
        "Bạn có dự định gì cho kỷ niệm ngày yêu nhau sắp tới không?",
        "Một điều bạn học được từ mình?",
        "Bạn thấy mình đã giúp bạn trưởng thành hơn thế nào?",
        "Nếu được chọn lại, bạn vẫn chọn yêu mình chứ?",
        "Điều gì làm bạn thấy mình đáng tin cậy nhất?",
        "Bạn thích nhất lúc mình cười hay lúc mình trầm ngâm?",
        "Một chủ đề mà bạn muốn hai đứa mình cùng thảo luận sâu hơn?",
        "Bạn thấy mình cần cải thiện điều gì để làm bạn hạnh phúc hơn?",
        "Một sở thích chung mà bạn rất quý trọng?",
        "Bạn cảm thấy thế nào khi mình giới thiệu bạn với bạn bè/gia đình?",
        "Điều gì làm bạn thấy mình là 'nhà' của nhau?",
        "Bạn thích nhất cách mình thể hiện tình cảm ở nơi công cộng không?",
        "Một câu nói của mình làm bạn nhớ mãi?",
        "Bạn thấy mình phản ứng thế nào khi bạn gặp khó khăn?",
        "Điều gì làm bạn thấy mình là ưu tiên hàng đầu của mình?",
        "Bạn có thích cách mình chăm sóc bạn khi bạn ốm không?",
        "Một món quà mình tặng mà bạn trân trọng nhất?",
        "Bạn thấy mình có điểm gì giống với bố/mẹ mình không?",
        "Điều gì làm bạn thấy mình là một người đặc biệt?",
        "Bạn thích nhất lúc mình nói chuyện về tương lai không?",
        "Một kỹ năng mà bạn muốn hai đứa cùng học?",
        "Bạn thấy mình xử lý áp lực công việc thế nào?",
        "Điều gì làm bạn thấy mình luôn mới mẻ trong mắt bạn?",
        "Bạn có thích cách mình dành thời gian chất lượng cho nhau không?",
        "Một điều bạn muốn mình làm cho bạn vào cuối tuần này?",
        "Bạn thấy mình có sự thay đổi tích cực nào gần đây không?",
        "Điều gì làm bạn thấy mình là một phần không thể thiếu trong cuộc sống của bạn?",
        "Bạn mong muốn điều gì nhất ở mình trong tháng này?"
    ];

    const promptDocs = prompts.map(text => ({
        text,
        type: PromptType.LOVE_MAP,
        active: true
    }));

    await Prompt.insertMany(promptDocs);
    console.log('Seeded 60 Love Map prompts');
};
