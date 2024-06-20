const helper = require("../../helper/helper");
const Company=require("../../models/admin/companyModel")
const uploadOnCloudinary=require("../../utils/cloudinary")
//Create A Company
exports.createCompany=async(req,res)=>{
    try {
        const {name,link}=req.body;

        if(!name || !link)
            {
                return res.status(400).json({
                    success:false,
                    message:"Enter all the required fields"
                })
            }
        const valid=await helper.verifyUrl(link);
        if(!valid)
            {
                return res.status(400).json({
                    succes:false,
                    message:"Invalid Company Link"
                })
            }
        const isCompanyExist=await Company.findOne({name});
        if(isCompanyExist)
            {
                return res.status(400).json({
                    success:false,
                    message:"Company Existed"
                })
            }
        const company=await Company.create({
            name,link
        })
    const avatarLocalPath = req.files?.companyImage[0]?.path;
    if(avatarLocalPath){
      const avatar = await uploadOnCloudinary(avatarLocalPath)
      if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
      }
    
      company.image = avatar.url;
    }
    await company.save();
    return res.status(201).json({
        succes:true,
        message:"Company Registered Successfully",
        data:company
    })
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
      }
}

//Edit Company
exports.updateCompany=async(req,res)=>{
    try{
        const companyDetails=req.body
        const companyId=req.params.id
        const updateCompany=await Company.findByIdAndUpdate(
          {_id:companyId},
          companyDetails,
          {
            new:true
          }
          );
          if(req.files && req.files.companyImage)
          {
            const avatarLocalPath = req.files?.companyImage[0]?.path;
            if(avatarLocalPath){
              const avatar = await uploadOnCloudinary(avatarLocalPath)
              if (!avatar) {
                throw new ApiError(400, "Avatar file is required")
              }
              updateCompany.image = avatar.url;
            }
          }
          await updateCompany.save();
          if (!updateCompany) {
            return res.status(401).json({
              success: false,
              message: "Company not found",
            });
          }
          res.status(201).json({
            success: true,
            data: updateCompany,
            message: "Company updated successfully",
          });
    }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
      }
}

//Delete a Company

exports.deleteCompany=async(req,res)=>{
    try{
        const companyId=req.params.id;
        const company = await Company.findByIdAndDelete(companyId);
        if (!company) {
          return res
            .status(404)
            .json({ success: false, error: "Comapny not found" });
        }
        res.status(201).json({ success: true,message:"Company Deleted Successfully", data: {} });
    }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
      }
}

//Get A Company

exports.getACompany=async(req,res)=>{
    try{
        const companyId=req.params.id;
        const company=await Company.findById(companyId);
        if(!company)
            {
                return res.status(400).json({
                    succes:true,
                    message:"Company Not Found"
                })
            }
        return res.status(201).json({
            succes:true,
            data:company
        })
    }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
      }
}

//Get All Company
exports.getAllCompany=async(req,res)=>{
    try{
        const company=await Company.find();
        if(company.length==0)
            {
                return res.status(400).json({
                    succes:true,
                    data:{},
                    message:"No Company Found"
                })
            }
        return res.status(201).json({
            succes:true,
            totalCompany:company.length,
            data:company
        })
    }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
      }
}

// Search Companies
exports.searchCompany = async (req, res) => {
    try {
      const { keyword } = req.query;
      const regex = new RegExp(keyword, "i");
      const companies = await Company.find({ name: regex });
      if (companies.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No companies found matching the search criteria",
        });
      }
      return res.status(200).json({
        success: true,
        totalCompanies: companies.length,
        data: companies,
      });
    } catch (err) {
      return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
  };
  
  // Sort Companies
  exports.sortCompany = async (req, res) => {
    try {
      const { sortBy } = req.query;
      let sortOption = {};
      switch (sortBy) {
        case "asc":
          sortOption = { name: 1 };
          break;
        case "desc":
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 }; 
          break;
      }
      const companies = await Company.find().sort(sortOption);
      if (companies.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No companies found",
        });
      }
      return res.status(200).json({
        success: true,
        totalCompanies: companies.length,
        data: companies,
      });
    } catch (err) {
      return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
  };
  