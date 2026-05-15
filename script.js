// ===== 生理年龄计算与报告生成 =====

document.getElementById('healthForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);
    const bloodSugar = parseFloat(document.getElementById('bloodSugar').value);

    // 验证
    if (!age || !gender || !height || !weight || !systolic || !diastolic || !bloodSugar) {
        alert('请填写所有必填项');
        return;
    }

    // 显示加载状态
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loading').style.display = 'inline-flex';
    submitBtn.disabled = true;

    // 模拟AI计算延迟
    setTimeout(() => {
        const result = calculateBiologicalAge(age, gender, height, weight, systolic, diastolic, bloodSugar);
        displayResult(result);
        
        // 恢复按钮
        submitBtn.querySelector('.btn-text').style.display = 'inline-flex';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
        submitBtn.disabled = false;
    }, 2000);
});

// ===== 生理年龄计算算法 =====
function calculateBiologicalAge(age, gender, height, weight, systolic, diastolic, bloodSugar) {
    // BMI计算
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // 基础生理年龄从实际年龄开始
    let bioAge = age;
    let adjustments = [];

    // === BMI 影响 ===
    let bmiStatus, bmiAdjust;
    if (bmi < 18.5) {
        bmiStatus = 'underweight';
        bmiAdjust = 1.5;
        adjustments.push({ factor: 'BMI偏低', value: +1.5 });
    } else if (bmi >= 18.5 && bmi < 24) {
        bmiStatus = 'normal';
        bmiAdjust = -1;
        adjustments.push({ factor: 'BMI正常', value: -1 });
    } else if (bmi >= 24 && bmi < 28) {
        bmiStatus = 'overweight';
        bmiAdjust = 2;
        adjustments.push({ factor: 'BMI偏高', value: +2 });
    } else {
        bmiStatus = 'obese';
        bmiAdjust = 4;
        adjustments.push({ factor: 'BMI肥胖', value: +4 });
    }
    bioAge += bmiAdjust;

    // === 血压影响 ===
    let bpStatus, bpAdjust;
    if (systolic < 120 && diastolic < 80) {
        bpStatus = 'optimal';
        bpAdjust = -2;
        adjustments.push({ factor: '血压理想', value: -2 });
    } else if (systolic < 130 && diastolic < 85) {
        bpStatus = 'normal';
        bpAdjust = 0;
        adjustments.push({ factor: '血压正常', value: 0 });
    } else if (systolic < 140 || diastolic < 90) {
        bpStatus = 'elevated';
        bpAdjust = 2;
        adjustments.push({ factor: '血压偏高', value: +2 });
    } else if (systolic < 160 || diastolic < 100) {
        bpStatus = 'high';
        bpAdjust = 4;
        adjustments.push({ factor: '高血压I级', value: +4 });
    } else {
        bpStatus = 'very_high';
        bpAdjust = 7;
        adjustments.push({ factor: '高血压II级', value: +7 });
    }
    bioAge += bpAdjust;

    // === 血糖影响 ===
    let bsStatus, bsAdjust;
    if (bloodSugar < 3.9) {
        bsStatus = 'low';
        bsAdjust = 1;
        adjustments.push({ factor: '血糖偏低', value: +1 });
    } else if (bloodSugar >= 3.9 && bloodSugar < 6.1) {
        bsStatus = 'normal';
        bsAdjust = -1;
        adjustments.push({ factor: '血糖正常', value: -1 });
    } else if (bloodSugar >= 6.1 && bloodSugar < 7.0) {
        bsStatus = 'prediabetic';
        bsAdjust = 3;
        adjustments.push({ factor: '血糖偏高(糖前期)', value: +3 });
    } else {
        bsStatus = 'diabetic';
        bsAdjust = 6;
        adjustments.push({ factor: '血糖异常(糖尿病范围)', value: +6 });
    }
    bioAge += bsAdjust;

    // === 性别修正 ===
    if (gender === 'female') {
        // 女性平均寿命更长，给予轻微优势
        bioAge -= 0.5;
    }

    // === 年龄段修正 ===
    if (age > 60) {
        // 老年人指标波动影响更大
        bioAge += (bioAge - age) * 0.2;
    }

    // 确保生理年龄在合理范围内
    bioAge = Math.round(Math.max(age - 15, Math.min(age + 20, bioAge)));

    return {
        actualAge: age,
        biologicalAge: bioAge,
        gender: gender,
        bmi: bmi.toFixed(1),
        bmiStatus: bmiStatus,
        systolic: systolic,
        diastolic: diastolic,
        bpStatus: bpStatus,
        bloodSugar: bloodSugar,
        bsStatus: bsStatus,
        height: height,
        weight: weight,
        adjustments: adjustments
    };
}

// ===== 显示结果 =====
function displayResult(result) {
    const resultSection = document.getElementById('result');
    const assessmentSection = document.getElementById('assessment');
    
    // 设置日期
    const now = new Date();
    document.getElementById('reportDate').textContent = 
        `报告生成时间：${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;

    // 年龄对比
    document.getElementById('resultActualAge').textContent = result.actualAge;
    document.getElementById('resultBioAge').textContent = result.biologicalAge;

    const bioAgeCard = document.getElementById('bioAgeCard');
    const ageSummary = document.getElementById('ageSummary');
    const diff = result.biologicalAge - result.actualAge;

    bioAgeCard.className = 'age-card bio-age';
    ageSummary.className = 'age-summary';

    if (diff < -2) {
        bioAgeCard.classList.add('younger');
        ageSummary.classList.add('younger');
        document.getElementById('ageCompareIcon').textContent = '🎉';
        ageSummary.innerHTML = `恭喜！你的生理年龄比实际年龄<strong>年轻 ${Math.abs(diff)} 岁</strong>！<br>说明你的身体状态保持得很好，请继续保持健康的生活方式。`;
    } else if (diff > 2) {
        bioAgeCard.classList.add('older');
        ageSummary.classList.add('older');
        document.getElementById('ageCompareIcon').textContent = '⚠️';
        ageSummary.innerHTML = `注意！你的生理年龄比实际年龄<strong>大 ${diff} 岁</strong>。<br>建议关注下方健康建议，及时调整生活习惯，必要时咨询医生。`;
    } else {
        bioAgeCard.classList.add('same');
        ageSummary.classList.add('same');
        document.getElementById('ageCompareIcon').textContent = '✨';
        ageSummary.innerHTML = `你的生理年龄与实际年龄<strong>基本一致</strong>。<br>身体状态处于正常水平，坚持良好习惯可以继续保持或改善。`;
    }

    // 指标详情
    generateMetrics(result);

    // 健康建议
    generateAdvice(result);

    // 显示结果区域
    resultSection.style.display = 'block';
    
    // 滚动到结果
    setTimeout(() => {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ===== 生成指标卡片 =====
function generateMetrics(result) {
    const grid = document.getElementById('metricsGrid');
    
    // BMI
    const bmiInfo = getBmiInfo(result.bmi, result.bmiStatus);
    // 血压
    const bpInfo = getBpInfo(result.systolic, result.diastolic, result.bpStatus);
    // 血糖
    const bsInfo = getBsInfo(result.bloodSugar, result.bsStatus);
    // 体重指数
    const weightInfo = getWeightInfo(result.height, result.weight, result.gender);

    const metrics = [bmiInfo, bpInfo, bsInfo, weightInfo];

    grid.innerHTML = metrics.map(m => `
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-name">${m.name}</span>
                <span class="metric-badge ${m.badgeClass}">${m.badge}</span>
            </div>
            <div class="metric-value">${m.value}</div>
            <div class="metric-desc">${m.desc}</div>
            <div class="metric-bar">
                <div class="metric-bar-fill" style="width:${m.barPercent}%;background:${m.barColor}"></div>
            </div>
        </div>
    `).join('');
}

function getBmiInfo(bmi, status) {
    const map = {
        'underweight': { badge: '偏低', badgeClass: 'badge-warning', desc: 'BMI低于18.5，体重偏轻，建议适当增加营养摄入。', barPercent: 25, barColor: '#f59e0b' },
        'normal': { badge: '正常', badgeClass: 'badge-normal', desc: 'BMI在18.5-24之间，体重处于健康范围。', barPercent: 55, barColor: '#10b981' },
        'overweight': { badge: '偏高', badgeClass: 'badge-warning', desc: 'BMI在24-28之间，建议控制饮食并增加运动。', barPercent: 75, barColor: '#f59e0b' },
        'obese': { badge: '肥胖', badgeClass: 'badge-danger', desc: 'BMI≥28，属于肥胖范围，需积极管理体重。', barPercent: 92, barColor: '#ef4444' }
    };
    const info = map[status];
    return { name: '🏋️ BMI 体质指数', value: bmi, ...info };
}

function getBpInfo(sys, dia, status) {
    const map = {
        'optimal': { badge: '理想', badgeClass: 'badge-normal', desc: '血压处于理想水平，心血管系统状态良好。', barPercent: 30, barColor: '#10b981' },
        'normal': { badge: '正常', badgeClass: 'badge-normal', desc: '血压在正常范围内，继续保持健康生活方式。', barPercent: 45, barColor: '#10b981' },
        'elevated': { badge: '偏高', badgeClass: 'badge-warning', desc: '血压略偏高，建议减盐饮食，定期监测。', barPercent: 65, barColor: '#f59e0b' },
        'high': { badge: '高血压I级', badgeClass: 'badge-danger', desc: '已达高血压标准，建议就医咨询并定期监测。', barPercent: 82, barColor: '#ef4444' },
        'very_high': { badge: '高血压II级', badgeClass: 'badge-danger', desc: '血压明显偏高，请尽快就医，遵医嘱用药。', barPercent: 95, barColor: '#ef4444' }
    };
    const info = map[status];
    return { name: '💓 血压', value: `${sys}/${dia} mmHg`, ...info };
}

function getBsInfo(bs, status) {
    const map = {
        'low': { badge: '偏低', badgeClass: 'badge-warning', desc: '空腹血糖偏低，注意规律饮食，避免低血糖发作。', barPercent: 20, barColor: '#f59e0b' },
        'normal': { badge: '正常', badgeClass: 'badge-normal', desc: '空腹血糖在正常范围(3.9-6.1)，糖代谢良好。', barPercent: 45, barColor: '#10b981' },
        'prediabetic': { badge: '糖前期', badgeClass: 'badge-warning', desc: '空腹血糖6.1-7.0，处于糖尿病前期，需加强管理。', barPercent: 72, barColor: '#f59e0b' },
        'diabetic': { badge: '异常', badgeClass: 'badge-danger', desc: '空腹血糖≥7.0，达到糖尿病诊断标准，请尽快就医。', barPercent: 90, barColor: '#ef4444' }
    };
    const info = map[status];
    return { name: '🩸 空腹血糖', value: `${bs} mmol/L`, ...info };
}

function getWeightInfo(height, weight, gender) {
    // 标准体重计算(改良Broca公式)
    let idealWeight;
    if (gender === 'male') {
        idealWeight = (height - 80) * 0.7;
    } else {
        idealWeight = (height - 70) * 0.6;
    }
    
    const diff = weight - idealWeight;
    const diffPercent = (diff / idealWeight) * 100;
    
    let badge, badgeClass, desc, barPercent, barColor;
    if (Math.abs(diffPercent) <= 10) {
        badge = '正常';
        badgeClass = 'badge-normal';
        desc = `标准体重约${idealWeight.toFixed(1)}kg，你的体重在标准范围内(±10%)。`;
        barPercent = 50;
        barColor = '#10b981';
    } else if (diffPercent > 10 && diffPercent <= 20) {
        badge = '偏重';
        badgeClass = 'badge-warning';
        desc = `标准体重约${idealWeight.toFixed(1)}kg，你超出标准${diffPercent.toFixed(0)}%，建议适当控制。`;
        barPercent = 70;
        barColor = '#f59e0b';
    } else if (diffPercent > 20) {
        badge = '超重';
        badgeClass = 'badge-danger';
        desc = `标准体重约${idealWeight.toFixed(1)}kg，你超出标准${diffPercent.toFixed(0)}%，需积极减重。`;
        barPercent = 88;
        barColor = '#ef4444';
    } else {
        badge = '偏轻';
        badgeClass = 'badge-warning';
        desc = `标准体重约${idealWeight.toFixed(1)}kg，你低于标准${Math.abs(diffPercent).toFixed(0)}%，建议加强营养。`;
        barPercent = 25;
        barColor = '#f59e0b';
    }

    return { name: '⚖️ 体重评估', value: `${weight} kg`, badge, badgeClass, desc, barPercent, barColor };
}

// ===== 生成健康建议 =====
function generateAdvice(result) {
    const adviceList = document.getElementById('adviceList');
    let advices = [];

    // BMI 建议
    if (result.bmiStatus === 'obese' || result.bmiStatus === 'overweight') {
        advices.push({
            icon: '🥗',
            title: '控制体重',
            text: '建议每日减少300-500大卡热量摄入，增加有氧运动（如快走、游泳）每周≥150分钟，逐步将BMI控制在正常范围。'
        });
    } else if (result.bmiStatus === 'underweight') {
        advices.push({
            icon: '🍖',
            title: '增加营养',
            text: '建议适当增加蛋白质和优质脂肪摄入，每日三餐规律进食，可适当增加加餐次数，配合力量训练增加肌肉量。'
        });
    }

    // 血压建议
    if (result.bpStatus === 'elevated' || result.bpStatus === 'high' || result.bpStatus === 'very_high') {
        advices.push({
            icon: '🧘',
            title: '管理血压',
            text: '建议低盐饮食（每日食盐<6g），戒烟限酒，保持规律作息，适度进行有氧运动。如血压持续偏高，请尽快就医。'
        });
    }

    // 血糖建议
    if (result.bsStatus === 'prediabetic' || result.bsStatus === 'diabetic') {
        advices.push({
            icon: '🍚',
            title: '控制血糖',
            text: '建议减少精制碳水化合物摄入，增加膳食纤维，避免含糖饮料。规律运动有助于改善胰岛素敏感性，建议定期复查血糖。'
        });
    } else if (result.bsStatus === 'low') {
        advices.push({
            icon: '🍬',
            title: '预防低血糖',
            text: '建议规律进食，避免长时间空腹。随身携带糖果或饼干，出现头晕、心慌等症状时及时补充糖分。'
        });
    }

    // 通用建议
    advices.push({
        icon: '😴',
        title: '规律作息',
        text: '保证每晚7-8小时高质量睡眠，避免熬夜。良好的睡眠有助于身体修复和激素平衡，是延缓衰老的关键。'
    });

    advices.push({
        icon: '🏃',
        title: '坚持运动',
        text: '每周进行至少150分钟中等强度有氧运动，结合力量训练2-3次。运动是最天然的"抗衰老药"，能有效降低生理年龄。'
    });

    advices.push({
        icon: '🧪',
        title: '定期体检',
        text: '建议每年进行一次全面体检，关注血压、血糖、血脂等核心指标变化，做到早发现、早干预。'
    });

    // 如果各项都好
    if (result.biologicalAge <= result.actualAge) {
        advices.unshift({
            icon: '🌟',
            title: '继续保持',
            text: '你的身体状态非常好！各项指标较为健康，请继续保持当前的生活方式，定期监测健康数据。'
        });
    }

    adviceList.innerHTML = advices.map(a => `
        <div class="advice-item">
            <span class="advice-icon">${a.icon}</span>
            <div class="advice-content">
                <h4>${a.title}</h4>
                <p>${a.text}</p>
            </div>
        </div>
    `).join('');
}

// ===== 重置表单 =====
function resetForm() {
    document.getElementById('healthForm').reset();
    document.getElementById('result').style.display = 'none';
    document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
}

// ===== 平滑滚动到锚点 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== 导航栏滚动效果 =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '10px 0';
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    } else {
        navbar.style.padding = '16px 0';
        navbar.style.boxShadow = 'none';
    }
});
