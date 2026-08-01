import HomeBanner from "../models/HomeBanner.modal.js";
import Category from "../models/Category.modal.js";
import Product from "../models/Product.modal.js";
import FAQ from "../models/FAQ.modal.js";
import SiteSetting from "../models/SiteSetting.modal.js";
import Enquiry from "../models/Enquiry.modal.js";
import User from "../models/User.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

/* =====================================================
   DATE HELPERS
===================================================== */

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

const getCurrentMonthRange = () => {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return {
    start,
    end,
  };
};

/* =====================================================
   GET COMPLETE DASHBOARD SUMMARY
===================================================== */

const getDashboardSummary = asyncHandler(
  async (req, res) => {
    const todayRange = getTodayRange();
    const monthRange = getCurrentMonthRange();

    const [
      /* Home banners */
      totalHomeBanners,
      activeHomeBanners,
      inactiveHomeBanners,

      /* Categories */
      totalCategories,
      activeCategories,
      inactiveCategories,
      homeCategories,

      /* Products */
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      homeProducts,

      /* FAQs */
      totalFAQs,
      activeFAQs,
      inactiveFAQs,

      /* Site settings */
      totalSiteSettings,
      activeSiteSettings,

      /* Enquiries */
      totalEnquiries,
      unreadEnquiries,
      readEnquiries,
      newEnquiries,
      contactedEnquiries,
      discussionEnquiries,
      quotedEnquiries,
      closedEnquiries,
      rejectedEnquiries,
      todayEnquiries,
      monthlyEnquiries,

      /* Users */
      totalUsers,
      adminUsers,
      normalUsers,
      activeUsers,
      inactiveUsers,

      /* Recent data */
      recentEnquiries,
      recentProducts,
      recentBanners,
    ] = await Promise.all([
      /* Home banners */
      HomeBanner.countDocuments(),
      HomeBanner.countDocuments({
        isActive: true,
      }),
      HomeBanner.countDocuments({
        isActive: false,
      }),

      /* Categories */
      Category.countDocuments(),
      Category.countDocuments({
        isActive: true,
      }),
      Category.countDocuments({
        isActive: false,
      }),
      Category.countDocuments({
        isActive: true,
        showOnHome: true,
      }),

      /* Products */
      Product.countDocuments(),
      Product.countDocuments({
        isActive: true,
      }),
      Product.countDocuments({
        isActive: false,
      }),
      Product.countDocuments({
        isActive: true,
        isFeatured: true,
      }),
      Product.countDocuments({
        isActive: true,
        showOnHome: true,
      }),

      /* FAQs */
      FAQ.countDocuments(),
      FAQ.countDocuments({
        isActive: true,
      }),
      FAQ.countDocuments({
        isActive: false,
      }),

      /* Site settings */
      SiteSetting.countDocuments(),
      SiteSetting.countDocuments({
        isActive: true,
      }),

      /* Enquiries */
      Enquiry.countDocuments(),

      Enquiry.countDocuments({
        isRead: false,
      }),

      Enquiry.countDocuments({
        isRead: true,
      }),

      Enquiry.countDocuments({
        status: "New",
      }),

      Enquiry.countDocuments({
        status: "Contacted",
      }),

      Enquiry.countDocuments({
        status: "In Discussion",
      }),

      Enquiry.countDocuments({
        status: "Quoted",
      }),

      Enquiry.countDocuments({
        status: "Closed",
      }),

      Enquiry.countDocuments({
        status: "Rejected",
      }),

      Enquiry.countDocuments({
        createdAt: {
          $gte: todayRange.start,
          $lte: todayRange.end,
        },
      }),

      Enquiry.countDocuments({
        createdAt: {
          $gte: monthRange.start,
          $lte: monthRange.end,
        },
      }),

      /* Users */
      User.countDocuments(),

      User.countDocuments({
        role: "Admin",
      }),

      User.countDocuments({
        role: "User",
      }),

      User.countDocuments({
        activeStatus: true,
      }),

      User.countDocuments({
        activeStatus: false,
      }),

      /* Recent enquiries */
      Enquiry.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "name company email phone product source status isRead createdAt"
        )
        .lean(),

      /* Recent products */
      Product.find()
        .populate(
          "category",
          "name slug"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "name slug category mainImage isActive isFeatured showOnHome createdAt"
        )
        .lean(),

      /* Recent banners */
      HomeBanner.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "title desktopImage order isActive createdAt"
        )
        .lean(),
    ]);

    const dashboardData = {
      overview: {
        homeBanners: totalHomeBanners,
        categories: totalCategories,
        products: totalProducts,
        faqs: totalFAQs,
        enquiries: totalEnquiries,
        users: totalUsers,
      },

      homeBanners: {
        total: totalHomeBanners,
        active: activeHomeBanners,
        inactive: inactiveHomeBanners,
      },

      categories: {
        total: totalCategories,
        active: activeCategories,
        inactive: inactiveCategories,
        showOnHome: homeCategories,
      },

      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        featured: featuredProducts,
        showOnHome: homeProducts,
      },

      faqs: {
        total: totalFAQs,
        active: activeFAQs,
        inactive: inactiveFAQs,
      },

      siteSettings: {
        total: totalSiteSettings,
        active: activeSiteSettings,
        configured:
          totalSiteSettings > 0,
      },

      enquiries: {
        total: totalEnquiries,
        unread: unreadEnquiries,
        read: readEnquiries,

        today: todayEnquiries,
        currentMonth: monthlyEnquiries,

        statuses: {
          new: newEnquiries,
          contacted: contactedEnquiries,
          inDiscussion:
            discussionEnquiries,
          quoted: quotedEnquiries,
          closed: closedEnquiries,
          rejected: rejectedEnquiries,
        },
      },

      users: {
        total: totalUsers,
        admins: adminUsers,
        users: normalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },

      recent: {
        enquiries: recentEnquiries,
        products: recentProducts,
        homeBanners: recentBanners,
      },
    };

    return res.status(200).json(
      new apiResponse(
        200,
        dashboardData,
        "Dashboard summary fetched successfully"
      )
    );
  }
);

export {
  getDashboardSummary,
};